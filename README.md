# Task Manager API - Built with Node.js and MongoDB Atlas

## Description
This project allows a user to create an account and add tasks. User can login, logout, update their profile, add and update tasks, delete their account, or view public profile data of another user. The project is built on **Node.js** with **Express**, and backed by a **MongoDB Atlas** database.

## How to Use

A Postman collection is provided for you to interact with the API. Click the button below.

[![Run in Postman](https://run.pstmn.io/button.svg)](https://app.getpostman.com/run-collection/10db075c3470e77b3cf6#?env%5BTask%20Manager%20API%20(prod)%5D=W3sia2V5IjoiaG9zdCIsInZhbHVlIjoiIiwiZW5hYmxlZCI6dHJ1ZX1d)

**Be sure to set your environment to "Task Manager API (prod)"**

### Instructions for Requests Requiring Additional Information

* **Create user** - In the body, set the name, email, password and age.

* **Login user** - In the body, set the email and password.

* **Create task** - In the body, set the task description and boolean with the completed status.

* **Read all tasks** - In the params, you can choose to search tasks by completion status or description string. You can also use pagination with *limit* and *skip*. Finally, you can choose a sort-by order, either *createdAt_desc* or *createdAt_asc*.

* **Read task** - In the params, set the *id* path variable to the returned id of the task that you want to read.

* **Read user** - In the params, set the *id* path variable to the returned id of the user that you want to read.

* **Update user** - In the body, set the new name and age.

* **Update task** - In the params, set the *id* path variable to the returned id of the task that you want to update. In the body, set the new completed status.

* **Delete task** - In the params, set the *id* path variable to the returned id of the task that you want to delete.

* **Upload avatar** - In the body, delete the filename if one is already there. Click the *Select Files* button and choose an avatar image to upload.
