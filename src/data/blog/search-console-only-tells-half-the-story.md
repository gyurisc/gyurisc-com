---
title: Search Console Only Tells You Half the Story
pubDatetime: 2026-09-06T06:00:00Z
description: Google Search Console showed me a site that was barely alive. Real analytics showed a different site entirely, one where most visitors never touched a Google results page.
draft: false
tags:
  - analytics
  - seo
  - indiehacking
  - google search console
  - datafast
---

A few months ago, I started working on a beach site called [Adriatic Atlas](https://adriaticatlas.com/?ref=gyurisc.com). I know a little bit about SEO and I know Google Search Console, so I configured GSC to learn when and how this website is going to be picked up by Google, which search terms might be valuable for me and how much traffic the site was receiving.

I was busy reviewing impressions, clicks, average position, and graphs that move up and down. Some weeks they went up. Most weeks it just sat there, with nothing changing. I would close the tab feeling like the site was talking to itself.

Then I put real analytics on it and found I was reading the wrong instrument.

The visitors were there. They just weren't arriving in a way Search Console can see. And it wasn't just a tiny amount. For this new site, over the last 30 days, ChatGPT sent 72 visitors to the site. Google sent 47. Out of 179 visitors in total, about 40% came from ChatGPT and 26% from Google. Others were coming from links dropped in communities: a thread there and a comment here, someone answering a question with a URL. None of this shows up in Search Console. Not as a small number. Not at all.

This is the part that took a while to sink in for me. Search Console isn't undercounting visits. It simply does not see them.

## It is a Google Search tool, not an analytics tool

Search Console reports exactly one thing: how your pages perform in Google's search results. Impressions when you appear, clicks when someone taps through, the queries that got you there, plus whether Google can index a page or something blocks indexing. It is useful, but that is the whole contract. It says so in the small print. I was the one treating this like it said something bigger.

So everything that isn't a Google results page is invisible to it. Bing. DuckDuckGo. A newsletter or a Reddit comment. A link someone texted a friend. And now an entire category of AI assistants that answer the question and hand over a source link without a search page ever loading.

That last one is the one that's growing and growing really fast.

## What does the other half look like?

The referrer list is the useful part for me. Not because my numbers are huge, but because the _shape_ of the traffic was nothing like I expected. I had been tuning pages against queries in a dashboard while actual people walked in through doors I did not know existed.

Two things changed after seeing this. First, I stopped judging the project by the Search Console line alone. It measures only one channel, but I was reading it as a verdict on whether the project was viable. Second, I started paying attention to how the pages read to an assistant, whether the facts are stated plainly enough to be quoted back to someone, rather than only how they read to a crawler.

I am currently using [Datafast](https://datafa.st/?via=krisztian) for this. Any decent analytics tool would do the job. The point isn't the tool, it's that you need something standing at the door counting who actually walks in.

## Keep both

None of this is an argument against GSC. It can do something no analytics tool can: it tells you what people typed, what queries my sites surfaces for, where my site ranks, and what Google can and cannot index. You cannot get that anywhere else, and it is worth checking.

But it answers one question, and one question only: how are you doing in Google? Ask it anything else and it will still answer "how are you doing in Google," and it is easy to make a mistake and believe that this is the full picture.

If Search Console is the only tab you have open, like I did for months and months, you are looking at only part of the story. It is worth finding out how big the rest is.
