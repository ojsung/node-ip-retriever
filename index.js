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
function default_1(ipFamily = 'all', ifName = 'all', retrieveLocal = false, countToRetrieve = 1) {
    if (countToRetrieve <= 0) {
        countToRetrieve = Infinity;
    }
    const matchMaker = new MatchMaker(countToRetrieve, retrieveLocal, ifName, ipFamily);
    const matchedInterfaceInfo = matchMaker.matchedInterfaceInfo;
    return matchedInterfaceInfo;
}
exports.default = default_1;
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
        const ips = [];
        let ipsLength;
        const interfaceKeys = Object.keys(this.interfaces);
        const interfaceKeysLength = interfaceKeys.length;
        for (let i = 0, j = interfaceKeysLength; i < j; ++i) {
            // Get the interface that matches the interface Key
            const interfaceKey = interfaceKeys[i];
            const iface = this.interfaces[interfaceKey];
            // If the interfaceKey is a match (does not return a null value for interfaceMatcher),
            // push the interface itself into the matched interfaces
            if (this.interfaceMatcher(interfaceKey)) {
                // match all of the ips we care about and push them into the array called "ips".
                // Don't @ me for not having this be a pure function.  It makes more sense to keep
                // pushing to the same function than to keep extending an array with another returned array
                // Anyway, this will eventually return a number with the current length of "ips"
                ipsLength = this.matchInterfaceInfo(iface, ips);
            }
            if (ipsLength && ipsLength >= this.countToRetrieve) {
                // if we have all the ips we care to retrieve, break
                break;
            }
        }
        return ips;
    }
    matchInterfaceInfo(networkInterfaceInfo, ips) {
        const networkInterfaceInfoLength = networkInterfaceInfo.length;
        let ipsLength;
        // For each ip grouping listed under the networkinterfaceinfo, etc
        for (let k = 0, m = networkInterfaceInfoLength; k < m; ++k) {
            const networkInterface = networkInterfaceInfo[k];
            const family = networkInterface.family;
            // Check and make sure that the family is one we care about
            const familyMatched = this.interfaceInfoMatcher(family);
            const isLocal = networkInterface.internal;
            // If familyMatched has a value and isn't null,
            if (familyMatched) {
                // and we want to retrieve any ip, regardless of whether it's local or not
                if (this.retrieveLocal) {
                    // add the ip address to the list of ips we're retrieving
                    ips.push(networkInterface.address);
                    ipsLength = ips.length;
                }
                else {
                    // else if we don't want to collect local ips,
                    if (!isLocal) {
                        // check if it is local.  If it isn't, push it to the ips we care about
                        ips.push(networkInterface.address);
                        ipsLength = ips.length;
                    }
                }
            }
            if (ipsLength && ipsLength >= this.countToRetrieve) {
                // If we've collected as many ips as we want to, stop.
                break;
            }
        }
        return ipsLength;
    }
    /**
     * Creates a matching function to match a string against an array of strings or a single string.
     * If 'all' was given, it will return a function that matches all.
     * @param generationMethod The name or array of names of the interfaces to match
     * @returns  A function that returns interface names.
     */
    matcherGenerator(generationMethod) {
        let matchBy;
        if (Array.isArray(generationMethod)) {
            // A function that will search the array of strings for the given string, and return the given string
            // if it exists in the array
            matchBy = (interfaceName) => {
                if (generationMethod.indexOf(interfaceName) > 0) {
                    return interfaceName;
                }
                else
                    return null;
            };
        }
        else if (generationMethod === 'all') {
            // A function that just returns anything fed to it
            matchBy = (stringToMatch) => stringToMatch;
        }
        else {
            // A function that compares two strings, and returns the string if it is the same
            matchBy = (stringToMatch) => {
                if (generationMethod === stringToMatch) {
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