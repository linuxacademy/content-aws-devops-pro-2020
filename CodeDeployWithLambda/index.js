var aws = require('aws-sdk');
var s3 = new aws.S3({apiVersion: '2006-03-01'});
var codedeploy = new aws.CodeDeploy();
 
exports.handler = function(event, context)
{

    /* runtime functions */
    function getS3ObjectAndCreateDeployment()
    {
        var artifact_type;
        var bucket;
        var key;

        // Get the s3 object to fetch application-name and deploymentgroup-name metadata.
        console.log("New Code Deploy Started: " + bucket + " : " + key);
        
	    s3.headObject(
	    {
		    Bucket: bucket,
		    Key: key
	    },
	    function(err, data)
	    {
            if (err)
            {
                console.log(err);
                context.done('Error', 'Error getting s3 object: ' + err);
            }
            else
            {
                createDeployment(data);
            }
        });
    }
 
 
    function createDeployment(data)
    {
        
        if (!data.Metadata['application-name'] || !data.Metadata['deploymentgroup-name'])
        {
            console.error('application-name and deploymentgroup-name object metadata must be set.');
            context.done();
        }
        
        var params =
        {
            applicationName: data.Metadata['application-name'],
            deploymentGroupName: data.Metadata['deploymentgroup-name'],
            description: 'Lambda invoked codedeploy deployment',
            ignoreApplicationStopFailures: false,
            revision:
            {
                revisionType: 'S3',
                s3Location:
                {
                    bucket: bucket,
                    bundleType: artifact_type,
                    key: key
                }
            }
        };
        
        codedeploy.createDeployment(params, 
            function (err, data)
            {
                if (err)
                {
                    console.log(err);
                    context.done('Error','Error creating deployment: ' + err);
                }
                else
                {
                    console.log("New Code Deploy Completed: " + bucket + " : " + key);
                    context.done();
                }
        });
    }
 
    bucket = event.Records[0].s3.bucket.name;
    
    //console.log('get key');
    key = event.Records[0].s3.object.key;
 
    //console.log('s3 upload happened');
 
    tokens = key.split('.');
    //console.log(tokens);
    
    artifact_type = tokens[tokens.length - 1];
    //console.log(artifact_type);
    
    if (artifact_type == 'gz')
    {
        artifact_type = 'tgz';
    }
    else if (artifact_type == 'zip')
    {
        artifact_type = 'tar';
    }
    
    getS3ObjectAndCreateDeployment();
};
