const {BigQuery} = require('@google-cloud/bigquery');
const fetch = require('node-fetch');
const nodemailer = require('nodemailer');
const bigquery = new BigQuery();

module.exports.query = async() =>{
  var yesterday = new Date(Date.now() - 86400000).toISOString().slice(0,10);
  var today = new Date().toISOString().slice(0,10);

  // Define query and params
  const query = `SELECT SUM(cost) AS cost
    FROM \`project-id.dataset-id.billing-export-table-name\`
    WHERE DATE(_PARTITIONTIME) = @date`;
  const options_yesterday = {
    query: query,
    location: 'US',
    params: {date: yesterday}
  };
  const options_today = {
    query: query,
    location: 'US',
    params: {date: today}
  };

  //Create query jobs
  const [job_yesterday] = await bigquery.createQueryJob(options_yesterday);
  const [job_today] = await bigquery.createQueryJob(options_today);
  //Wait for the query to finish
  const [results_yesterday] = await job_yesterday.getQueryResults();
  const [results_today] = await job_today.getQueryResults();
  //Save costs to variables
  const cost_yesterday = results_yesterday[0].cost;
  const cost_today = results_today[0].cost;
  
  //Check for alert
  if(cost_today > cost_yesterday){
    //calculate percent hike
    int perc_hike = 100*(cost_today - cost_yesterday)/cost_yesterday;
    var notification = perc_hike+"% billing spike"
    
    //Use SMTP for sending mail alerts
    let transport = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      secure: true,
      port: 465,
      auth: {
       user: 'user',
       pass: 'password'
      }
    });
    //Mail body
    const message = {
    from: 'abc@gmail.com', // Sender address
    to: 'xyz@domain.com',  // List of recipients
    subject: 'ALERT! GCP Billing Account', // Subject line
    html: '<b>May require action.</b><br><br>There has been a spike in the billing today.'
    };
    transport.sendMail(message, function(err, info) {
    if (err) {
      console.log(err)
    } else {
      console.log(info);
    }
    });

    //Google Chat notification
    fetch(process.env.webhookURL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json; charset=UTF-8',
    },
    body: JSON.stringify({
    'text': notification,
     }),
    }).then((response) => {
    console.log(response);
    });
  }
}
