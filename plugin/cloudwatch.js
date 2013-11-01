module.exports = function (service) {
    var aws = require ('aws-lib');
    cw = aws.createCWClient(service.from.id, service.from.secret);

    return function(funneler) {
        for (var serviceName in service.services) {
            var thisService = service.services[serviceName];
            (function (serviceName, thisService) {
                var now = new Date,
                start = new Date(now.getTime() - thisService.time * 60 * 1000);
                node = thisService.node;
                cw.call(
                    "GetMetricStatistics",
                    {
                        EndTime: now.toISOString(),
                        StartTime: start.toISOString(),
                        Period: thisService.period,
                        Namespace: thisService.namespace,
                        MetricName: thisService.metric,
                        'Statistics.member.1': thisService.type,
                        'Dimensions.member.1.Name': thisService.name,
                        'Dimensions.member.1.Value': thisService.value,
                        Unit: thisService.unit,
                    },
                    function(err, result) {
                        funneler({
                            'funnel': 'cloudwatch',
                            'nodeName': thisService.node,
                            'metricName': serviceName,
                            'reading': result.GetMetricStatisticsResult.Datapoints.member[thisService.type]
                        });
                    }
                );
            })(serviceName, thisService);
        }
    }
};

