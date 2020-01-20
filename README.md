# node-ip-retriever
Retrieves the IP addresses of your machine using os.networkInterfaces().  I honestly just got tired of typing out the same 10 lines of code over and over again, and this needs to be used in every single one of the microservices in my node ecosystem.
## How to use
Use the default import from ip-retriever
```javascript
const ipRetriever = require("retrieve-ip")
```

## Parameters
```javascript
/**
 * Retrieves the IP from the operating system, and returns it as a string
 * @param ipFamily IPv4 or v6.  For all, give the string "all."  Default is "all"
 * @param ifName The name of the interface for which you want to retrieve IP addresses.  For all, give the string "all." Default is "all"
 * @param retrieveLocal False by default.  If set to true, it will also include local addresses (127.0.0.1)
 * @param countToRetrieve How many IP addresses to retrieve.  By default, it will retrieve just one, the first it retrieves.  To retrieve all, give the number -1.
 */
 ```
 
 ## Node Example
 ```javascript
 const retrieveIp = require("retrieve-ip").default
 // This will retrieve all IPv6 addresses on the "Wi-Fi" interface that are not local.
 const currentIP = retrieveIp("IPv6", "Wi-Fi", false, -1)
 ```
 
 ## Node Typescript Example
 ```typescript
 import retrieveIp from 'retrieveIp'
 // This will retrieve the first matched IPv4 OR IPv6 ip address on any interface, regardless of whether the IP is local or not
 const currentIP = retrieveIp("all", "all", true, 1)
 ```

## Typescript
You can choose to use typescript/index.ts instead if you want to use the source file.  Otherwise, the index.d.ts is already included
