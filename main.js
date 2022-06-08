const fs = require('fs')
var parser = require('xml2json')
const axios = require('axios').default

const account = 123456
const publicLocations = '["AP_EAST_1", "AP_SOUTH_1"]'
const monitorStatus = 'DISABLED'
const monitorPeriod = 'EVERY_10_MINUTES'

const dir = '/Users/prodjito/Downloads/Recordings'
const userApiKey = 'your User API Key'
const filenames = fs.readdirSync(dir)

filenames.forEach(filename => {
    if (filename.includes('.recording')){
        console.log(filename);
        fs.readFile( dir + '/' + filename, function(err, data) {
            let swPayload = JSON.parse(parser.toJson(data))
            let monitorName = swPayload.recording.name
            let monitorUrl = swPayload.recording.steps.step.url
            let monitorValidationText
            swPayload.recording.steps.step.actions.action.forEach(function(action){
                if(action.type = 'VerifyContent'){
                    monitorValidationText = action.text
                }
            }) 

            console.log(monitorName)
            console.log(monitorUrl)
            console.log(monitorValidationText)

            const ngPayload = JSON.stringify({
                query: `mutation {
                    syntheticsCreateSimpleBrowserMonitor (
                      accountId: ${account}, 
                      monitor: {
                        locations: {
                          public: ${publicLocations}
                        }, 
                        name: "${monitorName}", 
                        period: ${monitorPeriod},
                        status: ${monitorStatus}, 
                        uri: "${monitorUrl}", 
                        advancedOptions: {
                          responseValidationText: "${monitorValidationText}", 
                          useTlsValidation: true
                        }
                      }) {
                      errors {
                        description
                        type
                      }
                    }
                  }`,
            });

            console.log(ngPayload)

            axios.post('https://api.newrelic.com/graphql', ngPayload, {
                headers: {
                    // 'application/json' is the modern content-type for JSON, but some
                    // older servers may use 'text/json'.
                    // See: http://bit.ly/text-json
                    'Content-Type': 'application/json',
                    'API-Key': userApiKey
                }
            })
            .then(function (response) {
                //console.log(response);
                console.log(response.data.errors)
            })
            .catch(function (error) {
                console.log(error);
            });
        });
    }
});