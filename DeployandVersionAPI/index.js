console.log('Loading Lambda function');

exports.handler = async (event, context, callback) => {
    let min = 0;
    let max = 10;
    
    let restultNum = Math.floor(Math.random() * max) + min;
    
    callback(null, restultNum);
};
