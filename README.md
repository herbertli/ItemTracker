# Item Tracker...

## Description
This app keeps track of where things are. Users can register and login, and once logged in, they can see their various locations and the various items stored in each location! The user can create new locations, create new items, and move items from place to place!

## Documents and Models
User:
* username
* password
* [Location]

Location
* name
* description
* [Item]
* User

Item
* name
* description
* quantity
* User

## Site Map
* A landing page
* A login screen
* A register screen
* A home screen/dashboard showing a graph with "Locations" and "Items" as nodes and edges as well as showing the user's locations
* Detailed location view showing details about location and the items stored there

## User Stories
1. I, a forgetful person, forgot where I put my keys. I search for an item called "My House Key", and I learn that "My House Key" was in my bag the entire time!
2. I, a warehouse manager, want to move supplies from Warehouse A to a new Warehouse B. I create a new Location, called "Warehouse B", and move the desired item from "Warehouse A" to "Warehouse B".

## Research Topics
* D3.js (4 points)
* User authentication using Passport (2 points)
* CSS framework, Bootstrap (2 points)
