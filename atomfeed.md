---
title: Mike @miked.codes
subtitle: Posts by Mike
permalink: feed.xml
url: https://miked.codes/
authorName: Mike D
authorEmail: mdouglas+posts@directive.io
---

<?xml version="1.0" encoding="utf-8"?>
<feed xmlns="http://www.w3.org/2005/Atom" xml:base="{{ metadata.url }}">
  <title>{{ title }}</title>
  <subtitle>{{ subtitle }}</subtitle>
  <link href="{{ url }}{{ permalink }}" rel="self"/>
  <link href="{{ url }}"/>
  <updated>{{ collections.post | getNewestCollectionItemDate | dateToRfc822 }}</updated>
  <id>{{ url }}</id>
  <author>
    <name>{{ authorName }}</name>
    <email>{{ authorEmail }}</email>
  </author>
  {%- for post in collections.post | reverse %}
  <entry>
    <title>{{ post.data.title }}</title>
    <link href="{{ url }}blog/{{ post.data.slug }}"/>
    <updated>{{ post.data.date | dateToRfc822 }}</updated>
    <id></id>
    <content xml:lang="en" type="html">{{ post.templateContent | elementToAbsoluteUrl: url }}</content>
  </entry>
  {%- endfor %}
</feed>
