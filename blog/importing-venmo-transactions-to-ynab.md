---
title: Importing Venmo transactions into YNAB
slug: importing-venmo-transactions-to-ynab
layout: post
date: 2021-10-26
tags:
    - post
    - Project
    - Budgeting
excerpt: How I use a tool I built to keep YNAB synced with activity from Venmo.
---

When Venmo started shutting down access to its API and You Need a Budget (YNAB) stopped its Direct Import feature for the service, it was left up to the users to figure out how to budget their money moving through Venmo. YNAB wrote a [blog post](https://www.youneedabudget.com/how-to-manage-venmo-in-ynab/) about it with some recommendations on how to manage funds and it's that blog post that motivated me to write [venmo2ynab](https://github.com/mike-douglas/venmo2ynab), a small script to help with importing Venmo transactions to YNAB.

This article is about how I use this tool to keep YNAB up to date with activity from my Venmo account. It's free to use so if it's something you'd like to try, read on.

## Who this tool is for

[venmo2ynab](https://github.com/mike-douglas/venmo2ynab) is a Python script that converts a Venmo statement to a CSV format suitable for importing into YNAB. It works for people who use Venmo and YNAB based on Option Two in the YNAB blog post [How to Manage Venmo in YNAB](https://www.youneedabudget.com/how-to-manage-venmo-in-ynab/). This tool may be helpful for you if:

1. You're a frequent user of Venmo and you **carry a balance in your account**
2. You've set up your Venmo account in YNAB to function like a checking account
3. You are comfortable with using the command line 🙂

If you were manually entering your transactions from Venmo into YNAB, this tool may be for you!

## Setting up venmo2ynab

The [GitHub repo's README](https://github.com/mike-douglas/venmo2ynab#readme) has the setup steps that are pretty easy, but I'll modify the installation in this post so that the script is installed globally (feel free to use a [virtualenv](https://docs.python.org/3/library/venv.html) if you are comfortable setting that up instead):

First, check out the [repo](https://github.com/mike-douglas/venmo2ynab), then `cd` to it.

Then in the command line, run:

```bash
sudo pip3 install .
```

You'll know it's successful when it finishes and when you type `venmo2ynab --help` in the CLI, you see this:

```bash
Usage: venmo2ynab [OPTIONS] [INPUT_FILES]... OUTPUT_FILE

Options:
    --help  Show this message and exit.
```

## Using the script

Below I'll outline the process that I go through to get my Venmo transactions into YNAB, starting with exporting my Venmo statement from the last month to a file, then running that exported file through the script, and finally importing the `.csv` file into YNAB.

### Step One: Download your Venmo statement

[Log into Venmo](https://venmo.com/account/sign-in), then go to your statements page:

{% image "/images/1-export-statement.png" %}
    Find Your Statements in the Venmo Sidebar
{% endimage %}

Change the dropdown at the top of the page to "Past 60 days" or whatever timeframe you'd like. The page will update and you'll see the table of transactions further down reflect this time period.

{% image "/images/1-go-to-statements.png" %}
    Export Your Statement from Venmo
{% endimage %}

Click the "Download CSV" button to download a file on to your computer with all of the transactions that you have selected with that dropdown. It'll be called `venmo_statement.csv`, note where it saves the file (in Mac OS, it puts it in your Downloads folder by default).

### Step Two: Convert your Venmo statement for YNAB

In this step, you'll use `venmo2ynab` to turn that downloaded statement to one that can be imported into YNAB. Specifically it follows "Option 2" in the [Formatting a CSV File help article](https://docs.youneedabudget.com/article/921-formatting-csv-file) on the YNAB website, combining inflow and outflow into one field and also preserving the payee and memo fields.

Open your terminal and locate the `venmo_statement.csv` file, and change to the directory:

```bash
$ cd ~/Downloads
$ ls
venmo_statement.csv
```

Next, run `venmo2ynab`, providing the Venmo CSV as the first argument and a **new** filename for where you want to save the YNAB-compatible CSV content:

```bash
venmo2ynab venmo_statement.csv to_ynab.csv
```

If successful, you won't see any output. You can always open up the `to_ynab.csv` file to make sure everything looks good. On to the final step!

### Step Three: Importing transactions into YNAB

In [YNAB](https://app.youneedabudget.com), locate your Venmo account and click the "File Import" button and click it. Locate your `to_ynab.csv` file and upload it (Hint: you can also drag and drop the CSV file into YNAB when your Venmo account is selected!)

{% image "/images/2-import-into-ynab.png" %}
    Import Your Venmo Transactions into YNAB
{% endimage %}

You'll be able to preview what's being imported in the next window. It's always worth glancing over it and making sure that Payees and Memos line up. You don't need to change any of the options in the dialog, just click "Import" when you're ready!

{% image "/images/2-preview-import.png" %}
    Preview Your Imported Venmo Transactions
{% endimage %}

On success, YNAB will tell you how many transactions were imported, and how many were skipped. It's smart enough to skip already-imported transactions, so you can run this process as often as you'd like!

Now you have new transactions to categorize and approve with all of your most recent Venmo transactions imported!

## Conclusion

I hope this little tool helps someone manage their budgets better with Venmo transactions. As a frequent Venmo user, keeping these transactions updated in YNAB has helped me have better control over my spending with it. If you find this useful or you have some ideas on how to make it better, hit me up on [Twitter](https://twitter.com/miked) or feel free to contribute to the [GitHub project](https://github.com/mike-douglas/venmo2ynab) yourself (it's free to use and modify!).

Ideally I'd love to automate this process even more, but it looks like the APIs needed to do that do not exist. If you have ideas on how to make this happen automatically without a lot of user interaction, please [reach out](https://twitter.com/miked)!
