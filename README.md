# Automating billing alerts on GCP

Keeping a keen eye on billing reports to avoid escalations is one of the bigger chanllenges when you opt for public Cloud vendors like GCP.
This is an attempt to make it easier and introduce some level of automation. Today's accumulated cost is compared to the previous day costs and emails are sent out if there are spikes in today's cost.

PRE-REQUISITES:
1. Billing Exports to BigQuery
2. Access to Create and Edit Cloud Funtions, Cloud Scheduler.
3. SMTP server to send emails.

Create a Cloud Function with the index.js and package.json. Replace the project-id, dataset-id and Setup a Trigger with a Cloud Pub/Sub Topic. Replace the SMTP credentials with your own. Create a Cloud Scheduler to send messages to the same topic and set the cron time as per your requirement, depending on how often you want the Cloud Function triggered. 
