#!/bin/bash

#I´m not quite sure but sometimes plugins needs a reinstall.

#clear all plugins
ionic plugin remove com.ionic.keyboard org.apache.cordova.console org.apache.cordova.inappbrowser org.apache.cordova.device org.apache.cordova.device-orientation
#ionic plugin remove  org.apache.cordova.device org.apache.cordova.device-orientation

#add all plugins
ionic plugin add com.ionic.keyboard org.apache.cordova.console org.apache.cordova.statusbar org.apache.cordova.inappbrowser org.apache.cordova.device org.apache.cordova.device-orientation
