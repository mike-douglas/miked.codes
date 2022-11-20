---
title: Keeping plants happy with sensors and automation
excerpt: How I set up an array of Arduinos with moisture sensors to monitor plant health and send alerts when they need watering.
feature: /images/plant_sensors_vis.gif
layout: post.njk
date: 2022-05-24
tags:
  - post
  - Projects
  - Plants
  - Coding
---

I've been growing my green thumb for a few years and have honed my plant care skills enough to amass a pretty healthy collection of green friends. A goal of mine last year was to finally get more comfortable with electronics, take on a few small projects, and learn a bit about circuit design and electrical components. Being a home automation nerd, I thought it would be fun to do a project that would help support my houseplant hobby.

So I dusted off some old [Arduino](http://arduino.cc) boards, and a box of parts I got on sale many years ago (RIP Radio Shack) and set off to learn and build something. **The goal: monitor the moisture level of the soil for my houseplants and alert me when they need watering.**

In this post I'll go through the hardware, software, monitoring, and alerting I put together in to keep my little plant sanctuary happy and thriving.

## The big picture

Home automation has always been a hobby of mine. I have an existing home network with wired and wireless connections throughout my home, as well as a server that functions as both a NAS and environment to run internal services and side projects that come and go. I could host a monitoring platform and a sensor data gathering service easily using this existing infrastructure, and with a few Arduinos with some sensors I could get readings on the moisture level of the plants where the moisture sensors are placed.

This is the diagram of what the finished product looks like:

{% wideimage "/images/Diagram-for-Plant-Sensors-1.png" %}
  Sensor, exporter, and monitoring platform setup
{% endwideimage %}

In broad strokes, this is what happens:

1. Every **X** seconds, the Arduino takes a reading for each of the attached sensors;
2. It reports the values (and additional metadata) to the Sensor Exporter;
3. Every **Y** seconds Prometheus collects the exported data from the Sensor Exporter;
4. There are Grafana Dashboards and Alerts that monitor time-series slices of that data to show graphs and visualizations, and alert via Telegram to me when things are out of the ordinary.

I don't have a lot of experience with Arduinos wiring up sensors, so I decided to tackle that first.

## Arduinos and sensors

I had one [Arduino Uno](https://www.arduino.cc/en/main/arduinoBoardUno) from when I was first attempting to get into electronics programming many years ago. I did basic tutorials like making LEDs blink and powering a tiny servo, but that's about the extent of it. Interacting with sensors turned out to be really straightforward, especially with the ones I bought. I purchased these [diymore Capacitive Soil Moisture Sensor](https://www.diymore.cc/products/2pcs-capacitive-soil-moisture-sensor-v1-2-analog-corrosion-resistant-dc-3-3-5-5v)s for the project. They're pretty affordable between $11-15 USD, so not a huge financial commitment if the project is a bust or I need to replace a component.

{% image "/images/capacitive_soil_sensor.jpeg" %}
  diymore Capacitive Soil Moisture Sensor
{% endimage %}

After doing some research on capacitive versus resistive sensors, I went with the capacitive variety for the price and overall lifespan. But what's does "capacitive moisture sensor" mean anyway? I know that a capacitor is essentially a battery (it stores charge), but how that applies to something like a *sensor*, I had no clue. The tutorial [Using Capacitive Soil Moisture Sensors on the Raspberry Pi](https://www.switchdoc.com/2020/06/tutorial-capacitive-moisture-sensor-grove/) on [SwitchDoc](https://www.switchdoc.com/) describes it nicely:

> The electrical component known as a capacitor consist of three pieces.  A positive plate, a negative plate and the space in-between the plates, known as the dielectric.
> [...]
> A**capacitive moisture sensor works by measuring the changes in capacitance caused by the changes in the dielectric**. It does not measure moisture directly (pure water does not conduct electricity well),  instead it measures the ions that are dissolved in the moisture[.]

Capacitive sensors report the energy stored in the soil around the plates of the sensor. When the soil is wet, you see a lower capacitance because water doesn't conduct electricity well. So the more wet the soil, the lower the reading; the more dry the soil the higher the reading.

### Wiring up the sensors

The next step was wiring up the sensors to an Arduino. I went through a few iterations of this, first starting with an Arduino Uno and an Ethernet Shield, and finally ending up with a much cleaner setup using an [Adafruit ATWINC1500 WiFi](https://www.adafruit.com/product/2999) module. Connecting the WiFi module gave me an excuse to fire up my soldering iron, which hadn't gotten any use for many years!

{% gallery %}
  {% galleryimage "/images/IMG_1230-Medium.jpeg" %}
    Final wired Arduino with three sensors and a Wifi module
  {% endgalleryimage %}
  {% galleryimage "/images/IMG_1229-Medium.jpeg" %}
    Moisture sensor placed inside of a plant
  {% endgalleryimage %}
{% endgallery %}

Wiring up the WiFi module and the sensors was pretty easy. I followed the [Adafruit ATWINC1500 WiFi Breakout tutorial](https://learn.adafruit.com/adafruit-atwinc1500-wifi-module-breakout/wiring-and-test?view=all) for connecting the wireless sensor to the Uno, and this [Interface Capacitive Soil Moisture Sensor v1.2 with Ardiuno](https://how2electronics.com/interface-capacitive-soil-moisture-sensor-arduino/) tutorial for connecting the moisture sensors to the board.

With the hardware out of the way, the next part of the project was well within my comfort zone: writing software.

## Gathering and exporting data

For my setup I needed to build two software components:

1. A program on the Ardiuno that would read the sensors and send the data somewhere, and
2. A service somewhere that would record that data and (eventually) export it to Prometheus.

To tackle the first part, I fired up the Arduino IDE and started writing code.

### Programming the Arduino Uno

The Arduno is programmed using a C-like language that is compiled and loaded on to the board via a USB cable.

Reading the moisture sensors used the built-in `analogRead(int)` function, where the argument passed is the number of the analog pin to which the sensor is connected. Each of my boards had 2-3 sensors attached to it (with more room to expand!), so I knew that each board would be reading and sending multiple values per interval.

Transmitting the sensor data would require connecting to the WiFi which I could do easily with the [WiFi101 library](https://www.arduino.cc/reference/en/libraries/wifi101/) included in the IDE. I'd connect to my wireless network and send requests to a RESTful webservice I would set up in the next step.

My code looked like this:

```c
#include <SPI.h>
#include <WiFi101.h>

typedef struct {
  int input;
  char name[10];
} sensor;

sensor sensors[2] = {
  { 0, "soil03" },
  { 1, "soil08" }
};

char ssid[] = "XXX";
char pass[] = "XXX";

char host[] = "XXX";
int port = 9800;

int status = WL_IDLE_STATUS;

WiFiClient client;
IPAddress ipAddress;

char ip[] = "xxx.xxx.xxx.xxx";

void setup() {
  Serial.begin(9600);

  // set the pins for the ATWINC1500 Feather
  WiFi.setPins(8, 7, 4);

  pinMode(4, OUTPUT);
  digitalWrite(4, HIGH);

  while (status != WL_CONNECTED) {
    status = WiFi.begin(ssid, pass);
    delay(5000);
  }

  ipAddress = WiFi.localIP();
  sprintf(ip, "%d.%d.%d.%d", ipAddress[0], ipAddress[1], ipAddress[2], ipAddress[3]);
}

void loop() {
  for (byte i = 0; i < (sizeof(sensors) / sizeof(sensors[0])); i++) {
    int val = analogRead(sensors[i].input);
    sendSensorReading(host, port, val, sensors[i].name, ip);
    Serial.print("sent ");
    Serial.println(sensors[i].name);
  }

  delay(10000);
}

void sendSensorReading(char* host, int port, int reading, char* sensor, char* readerIP) {
  client.stop();

  char buffer[40], payload[100];

  sprintf(payload, "{\"value\":%d,\"labels\":{\"sensor\": \"%s\", \"reader\": \"%s\"}}", reading, sensor, readerIP);
  Serial.println(payload);

  if (client.connect(host, port)) {
    client.println("POST /api/v1/metric/soil_moisture HTTP/1.1");
    client.println("User-Agent: arduino-ethernet");
    client.println("Content-Type: application/json");

    sprintf(buffer, "Host: %s", host);
    client.println(buffer);

    sprintf(buffer, "Content-Length: %d", strlen(payload));
    client.println(buffer);
    client.println();

    client.println(payload);
    client.println();
  }
}
```

[UnoWifiSensorReader.c Gist](https://gist.github.com/mike-douglas/96e64274ecb6f8ab4d61d034facf4807)

Neat! My Arduino is now reading the sensors connected to it every 10 seconds and sending it to a service living somewhere on my network. Now let's get to writing that API...

### Sensor exporter API

I wanted to keep the API lightweight and simple. In short, I needed it to accomplish two things:

1. Record sensor values (with labels) via an HTTP request, and
2. *Export* those metrics from the same service, so [Prometheus](https://prometheus.io) could collect it.

First thing's first, let's define the API. Here's a sample HTTP request I'd like to be able to make to this API:

```http
POST /api/v1/metric/soil_moisture
User-Agent: arduino-board
Content-Type: application/json
Content-Length: n

{
  "value": 100,
    "labels": {
      "sensor": "01",
        "reader": "arduino01"
    }
}
```

In the above request, I would expect that a value of `100` with labels `sensor` and `reader` would be stored for the metric named `soil_moisture`. Each of my sensors would have a different ID associated with them ( `01`, `02`, etc) and each would set the hostname/IP of the Arduino doing the reading for debugging. It didn't need persistent storage since Prometheus would house all of that, the API just needed to store *the most recent* values sent to it for each metric/label combination. Overall this made the API pretty lightweight.

The last thing I needed to do was create an endpoint for exporting metrics. This is the URL that Prometheus will poll every *n* seconds to record the values stored in the exporter. An example of that output is below:

```bash
$ curl http://localhost:9800/metrics
# HELP foo_metric foo_metric
# TYPE foo_metric gauge
soil_moisture{sensor="01",reader="arduino0"} 100
soil_moisture{sensor="02",reader="arduino0"} 302
soil_moisture{sensor="01",reader="arduino1"} 220
```

As you can see in the sample there are three values recorded for the `soil_moisture` each with a different set of labels. It's important to note that this API only knows how to store gauge metrics which are simply a number that can arbitrarily go up and down. You can read more about Prometheus' metric types [here](https://prometheus.io/docs/concepts/metric_types/).

This API is pretty extensible so if I wanted to add a way to store counters, histograms, or quantiles, it wouldn't be too much of a stretch. The API can also be used to export all sorts of data, not just moisture data.

The sensor-exporter project is available on GitHub at [sensor-exporter](https://github.com/mike-douglas/sensor-exporter). For ease of deployment, there's also a docker image hosted on docker hub at [mdouglas/sensor-exporter](https://hub.docker.com/r/mdouglas/sensor-exporter). Feel free to contribute to either of these!

## Monitoring and alerting

So my sensors are wired up and my little army of Arduinos are deployed, reading 2-3 moisture values from my houseplants every 10 seconds. Those values are shipped off to an instance of the sensor-exporter API running in my network. Finally, I [configured Prometheus](https://prometheus.io/docs/prometheus/latest/getting_started/) to collect data from the metrics endpoint of the sensor-exporter every 10 seconds.

Now for the fun part: making pretty charts and graphs, and alerting when moisture levels are low!

### Charts and dashboards

I set up a dashboard in [Grafana](https://grafana.com) with a chart for each sensor (8 currently), showing me the moisture level over 2 days. It looks something like this:

{% wideimage "/images/sensor_dashboard.png" %}
  A 2-day view of soil dryness for 4 of my monitored plants.
{% endwideimage %}

It took some fiddling with the metric query but I landed on the following for all of my sensors:

```promql
holt_winters(soil_moisture{sensor="soil02"}[$__range], .2, .8)
```

The `holt_winters(v, sf, tf)` [function](https://prometheus.io/docs/prometheus/latest/querying/functions/#holt_winters) function smoothes the time series out well enough to see the trends over a period of ~12 hours, in my experience. When I bring a new sensor online, it only takes a few minutes of readings for things to level out, but after that it's gold.

### Alerting

The final piece is alerting. Remember the goal from the beginning of this post? **I want my plants to alert me when they needed watering!** Thankfully Grafana makes this super easy.

I set up an alert for each sensor, so I now have these:

{% image "/images/alerts.png" %}
  My 8 "Water Me" alerts
{% endimage %}

I would like notifications sent to my mobile devices using Push notifications, and after looking around a bit I found that Telegram has a pretty awesome [Bot API Tutorial](https://core.telegram.org/bots). Telegram sends Push notifications to devices already so this was my free way to receive notifications straight to my devices when a plant needed watering.

Grafana has Telegram support built-in as a [contact point](https://grafana.com/docs/grafana/latest/alerting/unified-alerting/contact-points/), so once I configured that with the right set of keys I was all set. Here's an example of a fired alert and a resolved alert from my Plant Alerts Bot:

{% image "/images/telegram_alerts.png" %}
  Telegram alerts sent from Grafana when a plant needs watering.
{% endimage %}

For extra points, I recently bought a [Tidbyt](https://tidbyt.com) which is a really cool desktop-sized programmable LED screen. In a few hours I was able to push some code to it that queried Grafana for the status of the alerts to produce a cute little pixel-based visualization. When there is an alert that firing, the leaves of one the plants turns brown. It's the same visualization that's at the top of this post:

{% wideimage "/images/tidbyt.gif" %}
  Look at all those happy plants.
{% endwideimage %}

This gadget is tons of fun and I'll certainly have more to share about how I'm hacking the Tidbyt in an upcoming post.

## What's next

Phew! What started out as a way to learn some more about electronics turned into quite a project. Wiring up Arduinos, writing some code, and configuring monitoring and alerting tools. I did learn a lot about electronics, taking many detours to dive into circuits and other related topics along the way. It also gave me the chance to brush up on some other things that I was somewhat familar with but haven't messed around with for a while, namely Prometheus and Grafana.

I worked on this for a few months during my spare time and I continue to tweak things as they come up. I'm still learning the right values to alert on for soil dryness; ambient temperature and sunlight plays a huge part in the moisture values and therefore the alerting thresholds. Not to mention any agitation or moving of the sensor seems to temporarily throw things off. It's been a lot of fun monitoring my plants, the soil, and my watering habits through this system.

I have some other ideas on where to go from here:

- Box up all the electronics a little more cleanly. The board and the breadboard are just kind of sitting out there and some nice 3d printed boxes would look better put together and provide protection to the components. Any recommendations?
- More clean wiring for the sensors. I've extended a few with spare wire for my plants living off the window sill but something shielded and covered would look better and be safer, I think.
- Obviously, *moar sensors*! I have 8 sensors wired up across 3 Arduinos, with a total of 18 analog pins. And I have **a lot** of plants. This is likely the next and easiest step.

I hope you enjoyed following this post as much as I did writing it! If you've done something similar, want to do something like this, or just want to chat about it, please hit me up on [Twitter](https://twitter.com/miked)!
