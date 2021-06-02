import {ApolloClient, HttpLink, InMemoryCache, ApolloLink} from 'apollo-boost'
import {onError} from 'apollo-link-error'
import gql from 'graphql-tag'
import {getAccessToken, isLoggedIn} from "./auth";

const endpointURL = 'http://localhost:9000/graphql'

const errorLink = onError(({graphQLErrors}) => {
    if (graphQLErrors) graphQLErrors.map(({message}) => console.log(message))
})

const authLink = new ApolloLink((operation, forward) => {
    if (isLoggedIn()) {
        //request.headers['authorization'] = 'Bearer ' + getAccessToken();
        operation.setContext({
            headers: {
                'authorization': 'Bearer ' + getAccessToken()
            }
        })
    }
    return forward(operation);
});
const client = new ApolloClient({
    //link is the api url
    link: ApolloLink.from([
        errorLink,
        authLink,
        new HttpLink({uri: endpointURL})
    ]),
    cache: new InMemoryCache()
})


const jobDetailFragment = gql`
    fragment JobDetail on Job{
        description
        title
        id
        company{
            id
            name
        }
    }
`

const jobQuery = gql`
    query JobQuery($id: ID!){
        job(id: $id){
            ...JobDetail
        }
    }
    ${jobDetailFragment}
`

const jobsQuery = gql`
    query JobsQuery {
        jobs {
            id
            title
            company{
                id
                name
            }
        }
    }
`

const createJobMutation  = gql`
    mutation CreateJob($input: CreateJobInput) {
        job: createJob(input: $input) {
            ...JobDetail
        }
    }
    ${jobDetailFragment}
`;

const companyQuery = gql`
    query CompanyQuery($id: ID!) {
        company(id: $id){
            id
            description
            name
            jobs{
                title
                description
                id
            }
        }
    }`

export async function loadJob(id) {
    const {data: {job}} = await client.query({query: jobQuery, variables: {id}})
    return job;
}

export async function loadJobs() {
    const {data: {jobs}} = await client.query({query: jobsQuery, fetchPolicy: 'no-cache'});
    return jobs;
}

export async function loadCompany(id) {

    const {data: {company}} = await client.query({query:companyQuery, variables: {id}})
    return company;
}

export async function createJob(input) {

    const {data: {job}} = await client.mutate({
        mutation: createJobMutation,
        variables: {input},
        update: (cache, {data}) => {
            cache.writeQuery({
                query: jobQuery,
                variables: {id: data.job.id},
                data
            })
        }
    })
    return job;
}
