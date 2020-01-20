"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const os_1 = require("os");
/**
 * Retrieves the IP from the operating system, and returns it as a string
 * @param ipFamily IPv4 or v6.  For all, give the string "all."  Default is "all"
 * @param ifName The name of the interface for which you want to retrieve IP addresses.  For all, give the string "all." Default is "all"
 * @param retrieveLocal False by default.  If set to true, it will also include local addresses (127.0.0.1)
 * @param countToRetrieve How many IP addresses to retrieve.  By default, it will retrieve just one, the first it retrieves.  To retrieve all, give the number -1.
 */
function retrieveIp(ipFamily = 'all', ifName = 'all', retrieveLocal = false, countToRetrieve = 1) {
    const matchMaker = new MatchMaker(countToRetrieve, retrieveLocal, ifName, ipFamily);
    const matchedInterfaceInfo = matchMaker.matchedInterfaceInfo;
    return matchedInterfaceInfo;
}
exports.default = retrieveIp;
class MatchMaker {
    constructor(countToRetrieve, retrieveLocal, ifName, ipFamily) {
        this.countToRetrieve = countToRetrieve;
        this.retrieveLocal = retrieveLocal;
        this.interfaces = os_1.networkInterfaces();
        this._matchedInterfaceInfo = [];
        this.interfaceMatcher = this.matcherGenerator(ifName);
        this.interfaceInfoMatcher = this.matcherGenerator(ipFamily);
        this.checkForMatches();
    }
    get matchedInterfaceInfo() {
        return this._matchedInterfaceInfo;
    }
    checkForMatches() {
        let continueCounting;
        if (this.countToRetrieve > 1) {
            continueCounting = () => this._matchedInterfaceInfo.length < this.countToRetrieve;
        }
        else {
            continueCounting = () => true;
        }
        while (continueCounting()) { }
        const interfaceKeys = Object.keys(this.interfaces);
        const matchedInterfaces = [];
        interfaceKeys.forEach((interfaceKey) => {
            const iface = this.interfaces[interfaceKey];
            if (this.interfaceMatcher(interfaceKey)) {
                matchedInterfaces.push(iface);
            }
        });
        this.buildMatches(matchedInterfaces, this._matchedInterfaceInfo);
    }
    buildMatches(matchedInterfaces, matchedInterfaceInfo) {
        matchedInterfaces.forEach((matchedInterface) => {
            matchedInterface.forEach((interfaceInfo) => {
                const family = interfaceInfo.family;
                const ip = interfaceInfo.address;
                const isLocal = interfaceInfo.internal;
                const familyMatch = this.interfaceInfoMatcher(family);
                if (this.retrieveLocal) {
                    if (familyMatch) {
                        matchedInterfaceInfo.push(ip);
                    }
                }
                else {
                    if (family && !isLocal) {
                        matchedInterfaceInfo.push(ip);
                    }
                }
            });
        });
    }
    matcherGenerator(generationMethod) {
        let matchBy;
        if (Array.isArray(generationMethod)) {
            matchBy = (interfaceName) => {
                if (generationMethod.indexOf(interfaceName) > 0) {
                    return interfaceName;
                }
                else
                    return null;
            };
        }
        else if (generationMethod === 'all') {
            matchBy = (interfaceName) => interfaceName;
        }
        else {
            matchBy = (interfaceName) => {
                if (generationMethod === interfaceName) {
                    return generationMethod;
                }
                else
                    return null;
            };
        }
        return matchBy;
    }
}
//# sourceMappingURL=index.js.map