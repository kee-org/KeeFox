<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN"
        "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" lang="en">
<title>KeeFox - 0.1 build guidelines</title>
</head>

<body>
<h1>KeeFox</h1>
<h2>Build instructions</h2>

<p>We'll review and expand this as we go on but here's a rough idea of how to get this to compile.</p>

<p>I know there are a lot of bad things about this current procedure, including some that will affect end user deployment so we'll have to come up with some ideas to improve things over the next few months.</p>

<p>I can't test this on a 2nd XP system at the moment so I can't be certain that it will work out exactly as described. Please feedback any changes to this file as required so we can have a reliable procedure written down within a few releases.</p>

<p>The most likely cause of problems would be getting the various dependant libraries to work correctly - this can be due to missing information in your system PATH variable or DLLs that need registering. To help get you started as quickly as possible, I've tried to configure as many options as possible to use relative paths so if you use the full zip file with all dependencies included, you shouldn't need to change many configuration settings. If you already have the dependencies installed on your system you're probably better suited to fix it than I am. Unfortunately, I really can't remember the crucial steps I took to get everything working the first time. If anyone manages to get this working, please keep a note of which PATH settings and DLL regsvr32s are the important ones - if not, I'll experiment on other machines later in the year.</p>

<p>If you do not already have all the dependencies or are not sure, please grab the version of the source code which includes ICE*, Gecko SDK, etc. and extract the zip file to a new folder on your hard disk - my guess is that things will go smoother if it's somewhere with no spaces in the path name (e.g. C:\development\) but it may work elsewhere.</p>

<p>* The bundled version does not contain any ICE demos so visit <a href="http://www.zeroc.com/">zeroc</a> for the full package if you're interested in learning more.</p>

<p>If you've already got all the dependencies you can just extract and replace the keefox subtree as required.</p>

<p><a href="http://christomlinson.name/dl/keefox/source/0.1/0.1-including-deps.zip">Download the KeeFox 0.1 source files and required dependant libraries</a> (76MB)</p>
<p><a href="http://christomlinson.name/dl/keefox/source/0.1/0.1.zip">Download the KeeFox 0.1 source files only</a> (50KB)</p>

<p>I'm assuming you have KeePass already installed in "C:\Program Files\KeePass Password Safe" - if not, install it somewhere and replace the references to the executable in the VS project files and the project output directory (see below).</p>

<p>Other things you'll need are Firefox (duh) and .NET 2 (later versions should work fine too but we're only going to be using features from the 2.0 version and earlier).</p>

<p>Also note that this has all been made using Visual Studio 2008. I presume that it is possible to get it to compile with other tools but I can't help with that at the moment. There are a lot of important settings (and probably many redundant ones) in the visual studio project files relating to things like include files and library link files and compile+link options.</p>

<p>You may want / need to change this config setting in visual studio:<br/>
KeeICE project output: C:\Program Files\KeePass Password Safe\plugins\ - VS2008 doesn't seem to allow absolute paths here so it may or may not contain this value when you open the project.</p>

<p>Now set up your firefox development profile:</p>

<ol>
<li>run the mozilla profile manager and create a new profile called KeeFox</li>
<li>navigate to the extensions directory in that profile (e.g. C:\Documents and Settings\{USER}\Application Data\Mozilla\Firefox\Profiles\{PROFILE_ID}.KeeFox\extensions)</li>
<li>in that folder, create a new text file called chris.tomlinson@keefox containing only the absolute path to the output directory for the keefox extension component - {SOLUTION_DIR}\KeeFox\Firefox addon\KeeFox</li>
</ol>

<p>place a copy of the ICE debug DLLs into your firefox executable (program files) directory:<br/>
ice33d.dll<br/>
iceutil33d.dll<br/>
bzip2d.dll</p>

<p>Make sure the Ice.dll .NET component is in the KeePass plugins directory.</p>

<p>You'll find all those files in Ice-3.3.0-VC90\bin</p>

<p>You may want to run Firefox using a command like this:</p>

<pre>"C:\Program Files\Mozilla Firefox\firefox.exe" -P "KeeFox" -no-remote -console</pre>

<p>That loads your development profile, allows it to run side by side with your normal firefox profile and opens a console window where debug information can/will be displayed.</p>

<p>to test it out:</p>

<ul>
<li>run KeePass</li>
<li>create a new empty (no sample data) database - I recommend just using windows authentication to save time opening it while debugging, etc. since you won't be storing anything important in there.</li>
<li>run firefox (e.g. command above)</li>
<li>click on "test keefox" on the new toolbar and follow the instructions</li>
</ul>

<p>At the moment, this test is pretty crude and may not even be testing functions that will be used in the final release but it demonstrates many of the principles that we'll need when developing the extension further.</p>

<p>It shouldn't take more than a few seconds to complete. You can track the test progress in the console window if you chose to open it when you started firefox. You should see a log file similar to the one pasted below. Note one of the known issues (an exception is thrown - I think I just need to work out how to invoke the KeePass UI updates from the KeeICE thread but it'll wait for v0.2)</p>


<pre>
comp-impl.cpp::CountLogins - started
comp-impl.cpp::CountLogins - finished
comp-impl.cpp::GetAllLogins - started
we have received 0 KPEntry objects
comp-impl.cpp::AddLogin - start
Outgoing.cpp:472: Ice::UnknownException:
unknown exception:
System.InvalidOperationException: Cross-thread operation not valid: Control 'm_t
abMain' accessed from a thread other than the thread it was created on.
   at IceInternal.IncomingBase.handleException__(Exception exc) in d:\builds\dis
tbuilds\release\Ice-3.3.0\cs\src\Ice\Incoming.cs:line 151
comp-impl.cpp::AddLogin - finished
comp-impl.cpp::GetAllLogins - started
we have received 1 KPEntry objects
found a new KPEntry
found a new field...
found a password
found a new field...
found a username
appended new nsILoginInfo object
count: 1
comp-impl.cpp::GetAllLogins - finished
comp-impl.cpp::AddLogin - start
Outgoing.cpp:472: Ice::UnknownException:
unknown exception:
System.InvalidOperationException: Cross-thread operation not valid: Control 'm_t
abMain' accessed from a thread other than the thread it was created on.
   at IceInternal.IncomingBase.handleException__(Exception exc) in d:\builds\dis
tbuilds\release\Ice-3.3.0\cs\src\Ice\Incoming.cs:line 151
comp-impl.cpp::AddLogin - finished
comp-impl.cpp::GetAllLogins - started
we have received 2 KPEntry objects
found a new KPEntry
found a new field...
found a password
found a new field...
found a username
appended new nsILoginInfo object
found a new KPEntry
found a new field...
found a password
found a new field...
found a username
appended new nsILoginInfo object
count: 2
comp-impl.cpp::GetAllLogins - finished
comp-impl.cpp::AddLogin - start
Outgoing.cpp:472: Ice::UnknownException:
unknown exception:
System.InvalidOperationException: Cross-thread operation not valid: Control 'm_t
abMain' accessed from a thread other than the thread it was created on.
   at IceInternal.IncomingBase.handleException__(Exception exc) in d:\builds\dis
tbuilds\release\Ice-3.3.0\cs\src\Ice\Incoming.cs:line 151
comp-impl.cpp::AddLogin - finished
comp-impl.cpp::GetAllLogins - started
we have received 3 KPEntry objects
found a new KPEntry
found a new field...
found a password
found a new field...
found a username
appended new nsILoginInfo object
found a new KPEntry
found a new field...
found a password
found a new field...
found a username
appended new nsILoginInfo object
found a new KPEntry
found a new field...
found a password
found a new field...
found a username
appended new nsILoginInfo object
count: 3
comp-impl.cpp::GetAllLogins - finished
comp-impl.cpp::AddLogin - start
Outgoing.cpp:472: Ice::UnknownException:
unknown exception:
System.InvalidOperationException: Cross-thread operation not valid: Control 'm_t
abMain' accessed from a thread other than the thread it was created on.
   at IceInternal.IncomingBase.handleException__(Exception exc) in d:\builds\dis
tbuilds\release\Ice-3.3.0\cs\src\Ice\Incoming.cs:line 151
comp-impl.cpp::AddLogin - finished
comp-impl.cpp::GetAllLogins - started
we have received 4 KPEntry objects
found a new KPEntry
found a new field...
found a password
found a new field...
found a username
appended new nsILoginInfo object
found a new KPEntry
found a new field...
found a password
found a new field...
found a username
appended new nsILoginInfo object
found a new KPEntry
found a new field...
found a password
found a new field...
found a username
appended new nsILoginInfo object
found a new KPEntry
found a new field...
found a password
found a new field...
found a username
appended new nsILoginInfo object
count: 4
comp-impl.cpp::GetAllLogins - finished
comp-impl.cpp::CountLogins - started
comp-impl.cpp::CountLogins - finished
comp-impl.cpp::CountLogins - started
comp-impl.cpp::CountLogins - finished
comp-impl.cpp::CountLogins - started
comp-impl.cpp::CountLogins - finished
comp-impl.cpp::CountLogins - started
comp-impl.cpp::CountLogins - finished
comp-impl.cpp::CountLogins - started
comp-impl.cpp::CountLogins - finished
comp-impl.cpp::CountLogins - started
comp-impl.cpp::CountLogins - finished
comp-impl.cpp::CountLogins - started
comp-impl.cpp::CountLogins - finished
comp-impl.cpp::CountLogins - started
comp-impl.cpp::CountLogins - finished
comp-impl.cpp::CountLogins - started
comp-impl.cpp::CountLogins - finished
comp-impl.cpp::CountLogins - started
comp-impl.cpp::CountLogins - finished
</pre>

<p><a href="http://sourceforge.net"><img src="http://sflogo.sourceforge.net/sflogo.php?group_id=232316&amp;type=5" width="210" height="62" border="0" alt="SourceForge.net Logo" /></a></p>

</body>
</html>







------






KeeFox 0.1 source code released
-------------------------------

I'm pleased to announce that version 0.1 of KeeFox has now been released. The version number gives you a clue but just to be explicit, this is not suitable for end users and is probably not even suitable for any but the most intrigued developers.

This version demonstrates many of the functions and technologies that will be used as we develop the project further but it's not much to look at yet.

It may be useful for:
developers that are keen to learn more about how KeeFox will be architected
developers that would like to help understand KeeFox in order to help me get it past version 0.1 and on the road to a beta release early next year.
developers that are interested in seeing how a Firefox C++ XPCOM extension can be built using Visual Studio 2008
developers with a particular interest in the Firefox 3 nsILoginManagerStorage interface
people who think attempting to compile visual studio projects is even better than eating cake

[Compilation requirements and guidelines] are on the sourceforge [KeeFox project site]


------

Version 0.1 source code is now released - see http://keefox.sourceforge.net/0.1-build-guidelines.html

Remember, this version is not suitable for end users and is probably not even suitable for any but the most intrigued developers.

I'll stick to using this forum for discussion. I'll try to keep announcements and KeeFox specific issues in this thread but I think there will be some topics that could be of more general use to KeePass plugin developers so I'll split those into seperate threads.

Aslongasitsfree, thanks for offering to help. Do feel free to download the source code and play around - seeing examples of working code can be very useful part of learning your way around a compiler. However, I should warn that this is probably not the best first introduction to programming. It's a mix of different technologies and languages so it could be a bit too daunting if it's the first time you've ever tried to get a program to compile. Some of the libraries that KeeFox depends on are not very well documented so even experienced programmers might find it a challenge if the project doesn't compile first time (a distinct possibility). You might also find that needing a working copy of Visual Studio 2008 may be a bit of an impediment to just diving in.

I think there will be a lot of opportunities for people without strong C++/C# skills to contribute to KeeFox but it may be just a little bit too early for that now. There could be more easily accessible bits of coding required in future (e.g. javascript) as well as lots of important bug testing and fixing - stay tuned.

Dominik can correct me if this is out of date information but as far as I know, KeePass 2.x won't work properly on Linux because of a bug in Mono, although we all hope that's resolved sooner rather than later. I guess that Mac support is also via Mono so the same applies. A more pro-active approach to getting a cross-platform solution is to find a way to make this work with KeePass 1.x but this could be more difficult due to the limitations of the KeePass 1.x database structure - it's definitely an area to look into although I would prefer to get something working first rather than have two half finished versions.

Thanks,
Chris



Hi,

Thanks for the offer. It's great that you're so keen to learn. As I've just said on the forum () I think it might be expecting a bit much for you to learn the languages I'm using at the moment (C++ and C#) but there will be a lot of Javascript programming and XML writing further down the line so if you want to help out later in the year, it might be worth you taking a look at those topics and then if you can get a good grounding in them, try looking more specifically at how that can be applied to make Firefox extensions.

I'll get in touch with you again once the project is developed enough that someone without C++/C# experience can contribute something significant. In the mean time, if you do happen to go on a training course or something related to C++ then let me know because KeePass version 1 is all written in C++ and that cross-platform option would be a great thing to get working.






























Hi,

Are you aware of a problem with delays when adding tags to an article?

I'm not creating articles quickly enough to have worked out a definite pattern but I seem to select tags for an article and the tag count goes up but when viewing the tag list page, the article does not appear. The database appears to have the correct association between the article and the tag.

All visible caching options are switched off. I also tried the maintainance options to clear caches just in case.

The strange thing is that I have managed to get it to work each time it has happened but seemingly without doing anything at all - maybe it's a timeout issue somewhere? Oh, or maybe a timeZONE issue? Only just thought of that but maybe it is a 5 or 6 hour delay before it starts working. E.g. http://christomlinson.name/tags/release/