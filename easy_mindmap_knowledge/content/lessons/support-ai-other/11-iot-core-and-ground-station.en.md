---
id: support-ai-other-iot-core-and-ground-station
title: "AWS IoT Core, AWS Ground Station and Amazon Pinpoint: devices, satellites and customer messaging"
required: false
videoQuery: AWS IoT Core Ground Station Amazon Pinpoint end of support explained
---
## Optional: specialized services

This lesson is optional. Each service here is easy to recognize from a single clue. The CLF-C02 exam guide lists AWS IoT Core as in scope, but its out-of-scope list includes AWS Ground Station, Amazon Personalize, AWS Device Farm, AWS IQ and AWS Managed Services. Prioritize the in-scope services, and expect that exam-style questions may still mention some of the others.

## AWS IoT Core: connect devices

**AWS IoT Core** connects **IoT devices** such as factory sensors to AWS services and to each other. Devices talk to a managed **message broker** over protocols such as **MQTT**, MQTT over WebSockets and HTTPS, and AWS IoT Core for **LoRaWAN** supports low-power wide-area devices. Rules can route device messages to other AWS services for processing, and certificates and policies control which device can do what. Clue: "thousands of sensors must connect securely and send readings that other AWS services process".

## AWS IoT Greengrass: process data on the device

**AWS IoT Greengrass** is an open source **edge runtime** and cloud service that you install on your own devices (a gateway, a ship's onboard computer, a factory controller). It lets the device **act locally on the data it generates**: filter and aggregate sensor readings, run machine learning predictions, and react to local events, using components, AWS Lambda functions or Docker containers. The device can then export the results to AWS IoT Core and the AWS Cloud. Clue: "collect, format and process sensor data at the edge (for example at sea), then send it to AWS later". Compare: IoT Core is the cloud-side broker that devices connect to; Greengrass is software that runs processing on the device itself. Storage Gateway is not the answer here, because it only links on-premises storage to AWS and does not run your own processing.

## AWS Ground Station: satellite data

**AWS Ground Station** is a fully managed service for controlling satellite communications, **downlinking satellite data** and processing it. You do not build or maintain your own antennas, and you pay per minute of use. Clue: "communicate with satellites" or "receive earth-observation data".

## Amazon Pinpoint: customer engagement (support ended)

**Amazon Pinpoint** was a customer-engagement service for segments, campaigns and journeys across channels. AWS stopped accepting new customers on **May 20, 2025**, and its **engagement features ended on October 30, 2026**: the console and its endpoints, segments, campaigns, journeys and analytics are gone. Push notifications, one-time passwords and phone number validation continue. The messaging channels were renamed **AWS End User Messaging** for SMS and voice, and **Amazon SES** covers email. AWS recommends **Amazon Connect Customer** outbound campaigns and Customer Profiles for engagement. Treat Pinpoint as retired when you see it in a current scenario.

## Other specialized services

| Clue | Service |
| --- | --- |
| Sensors, MQTT, device messages | AWS IoT Core |
| Process sensor data on the device itself, then sync to AWS | AWS IoT Greengrass |
| Satellite contact, downlinked data | AWS Ground Station |
| Marketing email or transactional email | Amazon SES |
| Cloud contact center with outbound campaigns | Amazon Connect (Connect Customer) |
| Messages to many subscribers | Amazon SNS |

## Key points

- IoT Core connects devices to AWS through a managed message broker.
- IoT Greengrass runs processing on the device itself (edge), then exports data to AWS.
- Ground Station controls satellite communications and downlinks data, billed per minute.
- Pinpoint's engagement features ended on October 30, 2026; use SES, End User Messaging or Connect Customer.

## Sources

- [What is AWS IoT?](https://docs.aws.amazon.com/iot/latest/developerguide/what-is-aws-iot.html)
- [What is AWS IoT Greengrass?](https://docs.aws.amazon.com/greengrass/v2/developerguide/what-is-iot-greengrass.html)
- [Amazon Pinpoint end of support](https://docs.aws.amazon.com/pinpoint/latest/userguide/migrate.html)
