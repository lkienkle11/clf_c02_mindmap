---
id: support-ai-other-iot-core-and-ground-station
title: "AWS IoT Core, AWS Ground Station and Amazon Pinpoint: devices, satellites and customer messaging"
required: false
videoQuery: AWS IoT Core Ground Station Amazon Pinpoint end of support explained
---
## Optional: specialized services

This lesson is optional. These services are named in exam wording from time to time, but each one is easy to recognize from a single clue.

## AWS IoT Core: connect devices

**AWS IoT Core** connects **IoT devices** such as factory sensors to AWS services and to each other. Devices talk to a managed **message broker** over protocols such as **MQTT**, MQTT over WebSockets and HTTPS, and AWS IoT Core for **LoRaWAN** supports low-power wide-area devices. Rules can route device messages to other AWS services for processing, and certificates and policies control which device can do what. Clue: "thousands of sensors must connect securely and send readings that other AWS services process".

## AWS Ground Station: satellite data

**AWS Ground Station** is a fully managed service for controlling satellite communications, **downlinking satellite data** and processing it. You do not build or maintain your own antennas, and you pay per minute of use. Clue: "communicate with satellites" or "receive earth-observation data".

## Amazon Pinpoint: customer engagement (support ended)

**Amazon Pinpoint** was a customer-engagement service for segments, campaigns and journeys across channels. AWS stopped accepting new customers on **May 20, 2025**, and its **engagement features ended on October 30, 2026**: the console and its endpoints, segments, campaigns, journeys and analytics are gone. Push notifications, one-time passwords and phone number validation continue. The messaging channels were renamed **AWS End User Messaging** for SMS and voice, and **Amazon SES** covers email. AWS recommends **Amazon Connect Customer** outbound campaigns and Customer Profiles for engagement. Treat Pinpoint as retired when you see it in a current scenario.

## Other specialized services

| Clue | Service |
| --- | --- |
| Sensors, MQTT, device messages | AWS IoT Core |
| Satellite contact, downlinked data | AWS Ground Station |
| Marketing email or transactional email | Amazon SES |
| Cloud contact center with outbound campaigns | Amazon Connect (Connect Customer) |
| Messages to many subscribers | Amazon SNS |

## Key points

- IoT Core connects devices to AWS through a managed message broker.
- Ground Station controls satellite communications and downlinks data, billed per minute.
- Pinpoint's engagement features ended on October 30, 2026; use SES, End User Messaging or Connect Customer.

## Sources

- [What is AWS IoT?](https://docs.aws.amazon.com/iot/latest/developerguide/what-is-aws-iot.html)
- [What is AWS Ground Station?](https://docs.aws.amazon.com/ground-station/latest/ug/what-is-aws-ground-station.html)
- [Amazon Pinpoint end of support](https://docs.aws.amazon.com/pinpoint/latest/userguide/migrate.html)
