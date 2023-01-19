# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).


### Automated Deployment

You can also use Travis to automatically deploy updates to your Worker. Just add the following environment variables to your Travis settings:

- `CLOUDFLARE_EMAIL`
- `CLOUDFLARE_AUTH_KEY`
- `CLOUDFLARE_ZONE_ID`
- `AIRTABLE_API_BASE_ID`
- `AIRTABLE_API_KEY`

The `deploy` block in the `.travis.yml` file will automatically update your worker in Cloudflare when the `master` branch is built using the script at 
