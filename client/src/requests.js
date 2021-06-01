const endpointURL = 'http://localhost:9000/graphql'

export async function loadJobs() {
    const query = `
                {
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
    const {jobs} = await graphqlRequest(query)
    return jobs;
}

export async function loadJob(id){
    const query = `query JobQuery($id: ID!){
              job(id: $id){
                description
                title
                id
                company{
                  id
                  name
                }
              }
            }`
    const {job} = await graphqlRequest(query,{id})
    return job;
}

export async function loadCompany(id){
    const query = `
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
    const {company} = await graphqlRequest(query,{id})
    return company;
}

export async function createJob(input){
    const mutation = `
        mutation CreateJob($input: CreateJobInput) {
          createJob(input: $input) {
            id
            title
            description
            company {
              id
              name
            }
          }
        }

    `
    const {createJob} = await graphqlRequest(mutation,{input})
    return createJob;
}

 async function graphqlRequest(query, variables={}) {
    const response = await fetch(endpointURL, {
        method: 'POST',
        headers: {'content-type': 'application/json'},
        body: JSON.stringify({query, variables})

    });
    const resBody = await response.json();
    if(resBody.errors){
        const messages = resBody.errors.map(err => err.message).join('\n');
        throw new Error(messages)
    }
    return resBody.data;
}