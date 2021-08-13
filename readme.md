# Vaai Mobile App Read Me

## Repos

* Customer App - https://github.com/TheAppchemist/vaai-mobile
* Provider App - https://github.com/TheAppchemist/vaai-provider
* Firebase Cloud Functions - https://github.com/Appchemy/vaai-firebase-functions

## Tech Stack

* React Native
* Android Java (OBD Background Services)
* Firebase

## Building the app

You need to have yarn, react native and android SDK installed to run the app

1. First install the packages by running "yarn install"
2. Then finally build with "react-native run-android --variant=release"
3. To run as debug "react-native run-android"

## Project Structure

* app/components - reusable components
* app/pages - all app screens
* app/pages/forms - chatbot screens
* app/services - all REST API's and location services are here
* app/theme - store all theming aspects of the app
* app/redux - we started using redux only at a later stage of the app (currently only for OBD)
* app/assets/forms - the chatbots are setup using json files stored here
* app/assets/imgs - app image assets

## Components

* ChatForm - Used to load the chatbot JSON file
* CustomHeader - Vaai's Custom Header
* Drawer - Menu Drawer
* ProfileHeader - The profile page required a custom header
* VaaiBackground - The background used in the whole app

## Screens

* accident-checklist - shows a PNG image to the user regarding what to do after an accident
* add-device - lists bluetooth devices nearby, while filtering those with the text "VLINK" or "V-LINK" in them. This allows users to pair to the device
* camera - brings up a camera and returns a callback with the picture taken during multiple chatbot flow
* edit-profile - edit the profile of the user
* error-codes - scans the vehicle for error codes
* forgot-password - allows users to reset their password
* friend-location - sends a link to a friend to allow them to share their location during roadside assistance chatbot flow
* history - displays a list of activities the user has done
* home - **landing page of the app**
* license-picture - allows the user to take a picture of their driver's license
* loading - before the app loads, this screen has a spinner to show that an activity is pending (verifying if the user is logged in or not)
* location-required - this screen pops up if the user has not accepted the location permission for the app
* location - allows the user to pick a location on the map, either by getting their location or the user can type in the address. This is during the chatbot flows
* login - login into the app
* payment - fnb payment for the buy cover chatbot
* policies - shows all policies the user has ever bought
* policy - show a policy in more detail
* profile-picture - allows the user to take a profile picture
* profile - show the profile of the user
* roadside-payment - payfast payment for roadside assistance
* scan-license-disk - scans the license disk to identify the vin number of the vehicle. Also checks if the license disk has expired. This is for the buy cover chatbot
* signup - user sign up
* upload-policy-photos - the screen that pops up when a policy needs to be activated to taking pictures of the car
* verify-forgot-password - screen to enter the verification code received during the forgot password flow
* view-driver - view the driver on a map as they are about to come collect your vehicle for a tow (both roadside assistance and claim with tow enabled)

## Firebase Layout

### Realtime Database

* claims - claims are cached here. This data comes from Engine
* comingSoonEntries - "contact me" entries from the coming soon website are stored here
* history - stores a history of activities of the users
* logs - logs user actions if required (currently only profile picture and drivers license picture change)
* newLocationRequests - during roadside chatbot flow, if a user selects that this is for another person (not themselves), we need to request their location via a link we send them. That link includes an ID to this location request
* phoneVerifications - when signing up, the pin code for phone verifications is stored here
* policies - policies are cached here. This data comes from Engine
* positions - this is used for tracking the driver
* quotes - these are policy quotes before paying
* roadside - roadside assistant settings are stored here (baseFee, costPerKM, list of quotes)

### Cloud Firestore

* pickups - roadside assistance or claim tow pickup requests are stored here
* users - app user details

**The flow of the app is documented below:**

![Vaai Flow](https://github.com/TheAppchemist/vaai-mobile/blob/master/vaai-app-flow.png)

# Important

react-native-push-notifications should be version "^3.1.9". If you let it update to latest versions it will not work. Been there.

Also open the app in android studio and edit react-native-push-notifications/build.gradle and add 
```
    implementation 'com.google.firebase:firebase-messaging:21.1.0'
```