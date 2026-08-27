---
title: Search Console Only Tells You Half the Story
pubDatetime: 2026-08-27T09:00:00Z
description: Google Search Console showed me a site that was barely alive. Real analytics showed a different site entirely, one where most visitors never touched a Google results page.
draft: true
tags:
  - analytics
  - seo
  - indiehacking
---

For months, Google Search Console was the only place I looked to see how [Adriatic Atlas](https://adriaticatlas.com/?ref=gyurisc.com) was doing. Impressions, clicks, average position, the little chart that goes up and down. Some weeks it went up. Most weeks it just sat there. I'd close the tab feeling like the site was talking to itself.

Then I put real analytics on it, and found out I'd been reading the wrong instrument.

The visitors were there. They just weren't arriving in a way Search Console can see. A steady trickle was coming from ChatGPT and Perplexity, people asking an assistant where to swim on the Adriatic and getting pointed at my beach pages. More were coming from links dropped in communities: a thread here, a comment there, someone answering a question with a URL. None of that shows up in Search Console. Not as a small number. Not at all.

That's the part that took a while to sink in. Search Console isn't undercounting those visits. It has no field for them.

## It's a Google Search tool, not an analytics tool

Search Console reports exactly one thing: how your pages perform in Google's search results. Impressions when you appear, clicks when someone taps through, the queries that got you there, plus whether Google can index the page at all. That's the whole contract. It says so on the tin. I was the one treating the tin like it said something bigger.

So everything that isn't a Google results page is invisible to it. Bing. DuckDuckGo. A newsletter. A Reddit comment. A link someone texted a friend. And now an entire category of AI assistants that answer the question and hand over a source link without a search page ever loading.

That last one is the one that's growing.

## What the other half looked like

The referrer list was the useful part. Not because the numbers were huge, but because the _shape_ of the traffic was nothing like what I'd assumed. I had been tuning pages against queries in a dashboard while actual people walked in through doors I didn't know existed.

Two things changed after I saw it. I stopped judging the project by the Search Console line, because that line was measuring one channel and I was reading it as a verdict on the whole site. And I started paying attention to how the pages read to an assistant, whether the facts are stated plainly enough to be quoted back to someone, rather than only how they read to a crawler.

I'm using [Datafast](https://datafa.st) for this. Any decent analytics tool would do the job. The point isn't the tool, it's that you need something standing at the door counting who actually walks in.

## Keep both

None of this is an argument for dropping Search Console. It does something no analytics tool can: it tells you what people typed. Which queries you surface for, where you rank, what Google can and can't index. You cannot get that anywhere else, and it's worth checking.

But it answers one question, and one question only: how are you doing in Google? Ask it anything else and it will still answer "how are you doing in Google," and it's easy to mistake that for the full picture.

If Search Console is the only tab you have open, you're looking at the slice of your traffic that Google happened to send you. It's worth finding out how big the rest is.
