const db = require('./db')

const Query = {
    jobs:() => db.jobs.list(),
    companies: () => db.companies.list(),
}

//matches to the Object defined in schema.graphql
const Job = {
    company: (job) => db.companies.get(job.companyId)
}

module.exports = {Query, Job};