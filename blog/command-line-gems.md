---
title: Command-line gems that deserve a place in your muscle memory
layout: post
date: 2022-05-06
tags:
    - post
    - Reference
excerpt: Six command-line shortcuts or tidbits that I've used throughout my career that are still imprinted in my brain after all these years.
---

If you've been working in terminal for a while you are bound to start developing muscle memory around commands and shell idioms. They're the shortcuts that you can somehow recall from your long-term memory without much effort, burned in there either through repetition or through sheer force of will, that hope to save you time in what you do.

In this post I recall my top command line shortcuts, tidbits that have etched their way into my brain even after moving on from the part of my career where I use them regularly. What are some of yours?

## Search and replace in multiple files

```bash
perl -pi -e 's/SEARCH/REPLACE/g' FILE1 FILE2 ...
```

Early in my career I worked in K-12 education services and I had to do a lot of text processing and manual ETL for state reporting. This command has a special place in my heart because Perl was my first language,  and the brevity of this command has always impressed me. I've moved far on from Perl for daily use, but whenever I need to do a quick search and replace across multiple files I use this little gem. It's often faster than stumbling through VSCode find and replace for me as well. Because of the command-line flags this magic command is known colloquially as the "perl pie."

The flags broken down do the following:

- `-p` assume the expression is inside of a loop reading the contents of each file;
- `-i` edits the files passed as arguments in place; and
- `-e` runs the given expression.

## Split delimited input and print out columns

```bash
cat FILE.csv | awk -F',' '{print $2}'
```

Although I never went too deep with learning `awk`, this command embedded itself into my brain when I was working initially as a sysadmin and then as a developer working in insurance. This command works wonders slicing and dicing log files and parsing insurance rate spreadsheets. I know `cut` is more succinct and probably better suited for this specific purpose, but for some reason this stuck for me.

In `awk` the `-F` flag lets you define a field delimiter, and the `{...}` argument following it is the body of the program to run. `awk` will split each line of STDIN into numbered columns from `$1`, `$2` to `$n`, and in the example above will print out the second column from the file. The `-F` flag is even optional; `awk` will try to split the input on the first delimiter it finds which can make this an even more succinct little command.

I'll often end up with a few of these sandwiched between other commands to transform and tabulate data from large barely structured text input.

## Quick webserver for sharing files

```bash
$ python -mSimpleHTTPServer
# or with python3
$ python3 -mhttp.server
```

After I did my time with Perl, I moved to Python. Initially it was a shock: the simplicity of the syntax, the lack of curly braces!? But even in my reporting and text wrangling days `python` became my goto and I think this command sealed the deal for me. Before we had Airdrop (which admittedly still doesn't always work), this was a super quick way to send files back and forth.

In Python 2.x the `SimpleHTTPServer` module would create a very lightweight webserver listening on port `:8000` on your machine, serving everything in the current directory up. I would run this command, then hop over to another machine and browse or `curl` whatever I needed from it. In Python 3.x this module has been replaced with `http.server` so I've included it here. I will admit I'm still re-training my brain to use this newer and shorter version, but it will remain a very convenient way to transfer files or create a makeshift dev environment to serve HTML files.

## Counting unique lines from input

```bash
cat FILE | sort | uniq -c
```

This one is pretty short but it was especially helpful in my sysadmin days when I was looking through Apache log files and wanted to understand traffic hitting my servers. Used along with the `awk` command above, I would often use this to understand hosts hitting the server especially hard. This was before the days of structured logging, `jql`, and more modern log parsers and shippers.

## Quick shell loop

```bash
for x in a b c ; do echo $x ; done
```

Although I am a ZSH ride-and-die (and before that TCSH and CSH), Bash is everywhere. Fortunately this syntax also works for ZSH but not those others. I can't quite pinpoint when, but this *probably* lodged itself into my muscle memory around the time when I used to manage and catalog MP3s by hand. Imagine that!

It's still incredibly useful for running commands or generarting output for multiple things at once where the command may not support multiple arguments. I've also been known to use this where the `a b c` items in the loop are directories, and the body of the loop `cd`'d to the directory, did some stuff, and then `cd ..`. The contents of the loop can be multiple commands, each separated by `;`.

## Find files in a nested directory

```bash
find ./ -name "*foo*" -exec COMMAND {} \; 
```

The `find` command's arguments always confused me, so I learned just enough to get done the things I needed to for my day to day. When I need to perform more sophisticated searching (using `-atime` and the like) I'll jump back to the manual. But this became such a go-to for me for many years that it just comes out naturally when I have an inkling to perform an action on a bunch of files that are buried deep in directory structure.

The `-name` argument takes a wildcard string; if you want to search case-insensitively use `-iname`. And the `-exec` flag takes any command, where the `{}` is the name of the file to be slotted in as an argument. The `\;` at the end denotes the end of the command, a requirement for `find`, and for a while was the thing that kept me from using this more often until I burned it into my muscle memory.

---

Hopefully you find some of these useful in your daily meanderings in the terminal like they have for me. If you have other useful commands or snippets of CLI magic that have helped you get things done, reach out on [twitter](https://twitter.com/miked)!
