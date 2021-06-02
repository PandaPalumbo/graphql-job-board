const db = require('./db')

const Query = {
    job: (root, {id}) => db.jobs.get(id),
    company: (root, {id}) => db.companies.get(id),
    jobs:() => db.jobs.list(),
    companies: () => db.companies.list(),
}

//matches to the Object defined in schema.graphql
const Job = {
    company: (job) => db.companies.get(job.companyId)
}

const Company = {
    jobs: (company) => db.jobs.list().filter(job => job.companyId === company.id),
}

const Mutation = {
    createJob: (root, {input}, {user}) => {
        if(!user){
            throw new Error('Unauthorized');
        }
        const id = db.jobs.create({...input, companyId: user.companyId});
        return db.jobs.get(id);
    }
}

module.exports = {Query, Mutation, Job, Company};