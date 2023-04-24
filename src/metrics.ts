import type { FinalizeRequestMiddleware } from "@aws-sdk/types";
import { CloudWatch } from "@aws-sdk/client-cloudwatch";

let cloudWatch: CloudWatch;

export const metricMiddleWare: (namespace: string) => FinalizeRequestMiddleware<any, any> = (namespace) => (next, context) => async (args) => {
    const clientName = context.clientName as string;
    const commandName = context.commandName as string;
    const startTime = Date.now();
    const response = await next(args);
    const endTime = Date.now();
    const duration = endTime - startTime;
    cloudWatch = cloudWatch ?? new CloudWatch({});
    await cloudWatch.putMetricData({
        MetricData: [
            {
                MetricName: "Duration",
                Dimensions: [
                    {
                        Name: "Client",
                        Value: clientName,
                    },
                    {
                        Name: "Command",
                        Value: commandName,
                    },
                ],
                Unit: "Milliseconds",
                Value: duration,
            },
        ],
        Namespace: namespace,
    });
    return response;
}
