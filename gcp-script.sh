#!/bin/bash
echo "Script to automate notifications for gcp billing alerts"

#setup the pub/sub topic
echo "Step 1: Setting up pub/sub topic to be configured for trigger"
read -p 'Please enter the name for the topic: ' topic
echo "Creating the topic ..."
gcloud pubsub topics create $topic

#setup the Cloud Scheduler job
echo "Step 2: Setting up the scheduler job"
read -p 'Please enter the name for the job: ' job
echo "Setting up the cron job ..."
gcloud scheduler jobs create pubsub $job --schedule="0 */3 * * *" --topic=$topic --message-body="trigger cf" --timezone="Asia/Kolkata"

#setup cloud-function
echo "Step 3: Setting up the Cloud Function with Google Chat integration"
read -p 'Enter the name of cloud function: ' cloudfunction
read -p 'Enter the Google Chat webhook URL: ' webhookURL
echo "Creating the Cloud Function ..."
gcloud functions deploy $cloudfunction --entry-point=query --runtime=nodejs10 --set-env-vars=webhookURL=$webhookURL --trigger-topic=$topic

echo "Setup Completed!"
