# Encrypted Bookmarks Exporter Add-on for Firefox browser.

## 📋 Table of content

- [Description](#-description)
  - [Motivation](#-motivation)
- [Installation & Usage](#-Installing-&-Debugging-in-Firefox)


<br/>

## 📖 Description
This is my final project at Software Security/Cybersecurity course as part of academic studies.
<br/><br/>
This add-on for Firefox browser allows user to export bookmarks into encrypted file to store it locally, as well as decrypt the file and import bookmarks into browser using this add-on.
<br/><br/>
Supported Browsers: `Firefox.`
<br/><br/>

### Motivation:
Nowdays web surfing is essential for every computer user.
<br/><br/>
Therefore, the bookmarks list in browser likely to contain personal info at dangerous scales.
<br/><br/>
The bookmarks exposing sites the user visiting on regular basis
such as sensetive services (banks, social networks) and habbits (like saved articles) revealing life style of user.
<br/><br/>
I have noticed that the only options to export bookmarks in the most popular browsers is to export the bookmarks list into HTML file or JSON,
which stores the bookmarks explicitly on local drive and allows even low-skilled computer user get access and read bookmarks list as text.
<br/><br/>
I developed this addon in attempt to secure personal data contained at exported bookmarks.
Unlike standard build-in-browsers exporting methods, it allows user to store bookmarks as backup file locally while preventing unauthorized access to stored bookmarks.
<br/><br/>
Also, the encrypted format makes is safer to transfer the stored bookmarks across devices and import them using physical storage only, such as usb drive.
What makes it more secure. Less transfering bookmarks throught internet makes them less likely to be stolen by network sniffers.
Thought, sniffers (man-in-the-middle) still can steal information about which site user entered at the moment, 
it will protect from use cases in which whole bookmarks list is syncronized across devices thorought internet. 
As there is no guranties that build-in-browser syncronization methods implement heavy encryption.
<br/><br/>
This way the bookmarks don't have to be transfered throught internet while stays secure all the way to new device,
i.e. will not be exposed "as is" to curious people that got access to physical storage.
<br/>

## Installing & Debugging in Firefox 
1. Install Firefox browser on your device.<br/>
2. Enter this adreess into Firefox's Searchbar:
```firefox search bar
    about:debugging#/runtime/this-firefox
```
3. Here opens debugging page and we can `Load Temporary Add-on`, click this button.<br/>
4. Next, locate folder with add-on and select [manifest.json](manifest.json "manifest.json") file in it.<br/>
5. Optionally, open add-on's console by clicking `Inspect` to inspect log.
