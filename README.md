# TA-ALLOCATION PORTAL

TA Allocation Web Application for University using MERN Stack. Super Admin can assign HOD for the particular department. Courses can be floated by the HOD of the department and teachers can select students for their courses.

FrontEnd Code - https://github.com/powercorp1/TA_Frontend

## Workflow

![App Screenshot](https://i.postimg.cc/htQmBSCn/TA-Allocation-Portal.png)

### Installation

Install the following step by step in order to get a development environment up and running.

#### 1. Node.js

##### Windows

Visit the nodejs website here ([Install Node](https://nodejs.org/en/download/)) and choose the windows installer option
with the appropriate architecture of your computer.

##### Ubuntu

Refresh your local package index by typing :

```
$ sudo apt update
```

Adding the PPA of Node Source Repository :

```
$ curl -sL https://deb.nodesource.com/setup_12.x | sudo -E bash -
```

Installing Node js. This will also install **npm** long with node so there is no need to download npm separately.

```
$ sudo apt-get install nodejs
```

After installation verify and check the installed verison :

```
$ node -v
```

Also check the npm version :

```
$ npm -v
```

For more reference - [installation instructions](https://tecadmin.net/install-latest-nodejs-npm-on-ubuntu/)

##### CentOS 7 or Fedora

Please follow the link to install npm and node on CentOS or Fedora :

```
https://computingforgeeks.com/how-to-install-nodejs-on-centos-fedora/
```

#### 2. MongoDB & MongoDB Compass

##### Windows

Please follow the instructions given in the documentation -
[Mongo Docs Windows](https://docs.mongodb.com/manual/tutorial/install-mongodb-on-windows/)

##### Ubuntu

_MongoDB Community Edition_ :
Please follow the instructions given in the documentation -
[Mongo Docs Ubuntu](https://docs.mongodb.com/manual/tutorial/install-mongodb-on-ubuntu/)

_MongoDB Compass_ :
Please follow the instructions given in the documentation -
[MongoDB compass Ubuntu](https://docs.mongodb.com/compass/master/install/)

##### CentOS

_MongoDB Community Edition_ :
Please follow the instructions given in the documentation -
[Mongo Docs CentOS](https://docs.mongodb.com/manual/tutorial/install-mongodb-on-red-hat/)

_MongoDB Compass_ (Not required unless direct visualisation of database is needed) :

```
sudo yum install mongodb-compass-1.20.4.x86_64.rpm
```

#### 3. Setup

##### Clone the repository.

##### Front-End

###### SSH

```
git clone git@github.com:RGLxAkuma/TA-Allocation-Portal-Frontend.git
```

###### HTTPS

```
git clone https://github.com/RGLxAkuma/TA-Allocation-Portal-Frontend.git
```

###### GitHub CLI

```
gh repo clone RGLxAkuma/TA-Allocation-Portal-Frontend
```

##### Back-End

###### SSH

```
git clone git@github.com:RGLxAkuma/TA-Allocation-Portal-Backend.git
```

###### HTTPS

```
git clone https://github.com/RGLxAkuma/TA-Allocation-Portal-Backend.git
```

###### GitHub CLI

```
gh repo clone RGLxAkuma/TA-Allocation-Portal-Backend
```

##### Install npx if not already installed - This can be used to run react using the local version.

```
npm i -g npx
```

Execute the following commands :

```
cd TA-Allocation-Portal-Frontend
npm i
```

execute the following commands :

```
cd TA-Allocation-Portal-Backend
npm i
```

> All the dependencies will be installed.

After the above steps are completed, in both the backend and frontend folders, add a file named '.env'
and add all the required parameters.

## Running the web app locally

Open two terminal windows and locate to TA-Allocation-Portal-Frontend and TA-Allocation-Portal-Backend respectively one
in each of the terminal.

In the terminal where you navigated to TA-Allocation-Portal-Frontend folder execute the following command :

```
npm start
```

> React will listen to port 3000 by default

In the terminal where you navigated to backend folder execute the following command :

```
npm start

or

npx nodemon

or

node server.js
```

> If nodemon is not installed then use `npm i --save nodemon` in the same terminal to install it.

Now open a web browser and go to the url [http://localhost:4000](http://localhost:4000) to use the web app.

## Built With

**MERN STACK**


- [![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)](https://github.com/mongodb/mongo) - DataBase
- [![Express.js](https://img.shields.io/badge/Express.js-404D59?style=for-the-badge)](https://rometools.github.io/rome/) - Backend web application framework
- [![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev/learn) - Frontend web application framework
- [![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)](https://maven.apache.org/) - Backend web framework

## Authors

- **Prathamesh Jondhale** -[RGLxAkuma](https://github.com/RGLxAkuma)
- **Himanshu Kumar** -[Himanshukr033](https://github.com/Himanshukr033)

## Acknowledgments

- Dr. Albert Sunny
- Dr. Anand T. N. C.
