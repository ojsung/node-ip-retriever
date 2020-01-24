import { networkInterfaces, NetworkInterfaceInfo } from 'os'
/**
 * Retrieves the IP from the operating system, and returns it as a string
 * @param ipFamily IPv4 or v6.  For all, give the string "all."  Default is "all"
 * @param ifName The name of the interface for which you want to retrieve IP addresses.  For all, give the string "all." Default is "all"
 * @param retrieveLocal False by default.  If set to true, it will also include local addresses (127.0.0.1)
 * @param countToRetrieve How many IP addresses to retrieve.  By default, it will retrieve just one, the first it retrieves.  To retrieve all, give the number -1.
 */
export default function(
  ipFamily: 'all' | 'IPv6' | 'IPv4' = 'all',
  ifName: string | string[] | 'all' = 'all',
  retrieveLocal: boolean = false,
  countToRetrieve: number = 1
): string[] {
  if (countToRetrieve <= 0) {
    countToRetrieve = Infinity
  }
  const matchMaker = new MatchMaker(countToRetrieve, retrieveLocal, ifName, ipFamily)
  const matchedInterfaceInfo = matchMaker.matchedInterfaceInfo
  return matchedInterfaceInfo
}

class MatchMaker {
  constructor(
    private countToRetrieve: number,
    private retrieveLocal: boolean,
    ifName: string | string[],
    ipFamily: string
  ) {
    this.interfaceMatcher = this.matcherGenerator(ifName)
    this.interfaceInfoMatcher = this.matcherGenerator(ipFamily)
    this._matchedInterfaceInfo = this.checkForMatches()
  }

  // These two callbacks are currently undefined, but will be used to match the name of the interface, then to match the
  // section of the interface information we care about
  private interfaceMatcher: (interfaceName: string) => string | null
  private interfaceInfoMatcher: (interfaceName: string) => string | null
  private interfaces: { [key: string]: NetworkInterfaceInfo[] } = networkInterfaces()
  public get matchedInterfaceInfo() {
    return this._matchedInterfaceInfo
  }

  private _matchedInterfaceInfo: string[]

  private checkForMatches(): string[] {
    const ips: string[] = []
    let ipsLength: number | undefined
    const interfaceKeys: string[] = Object.keys(this.interfaces)
    const interfaceKeysLength: number = interfaceKeys.length
    for (let i = 0, j = interfaceKeysLength; i < j; ++i) {
      // Get the interface that matches the interface Key
      const interfaceKey = interfaceKeys[i]
      const iface = this.interfaces[interfaceKey]
      // If the interfaceKey is a match (does not return a null value for interfaceMatcher),
      // push the interface itself into the matched interfaces
      if (this.interfaceMatcher(interfaceKey)) {
        // match all of the ips we care about and push them into the array called "ips".
        // Don't @ me for not having this be a pure function.  It makes more sense to keep
        // pushing to the same function than to keep extending an array with another returned array
        // Anyway, this will eventually return a number with the current length of "ips"
        ipsLength = this.matchInterfaceInfo(iface, ips)
      }
      if (ipsLength && ipsLength >= this.countToRetrieve) {
        // if we have all the ips we care to retrieve, break
        break
      }
    }
    return ips
  }

  private matchInterfaceInfo(
    networkInterfaceInfo: NetworkInterfaceInfo[],
    ips: string[]
  ): number | undefined {
    const networkInterfaceInfoLength = networkInterfaceInfo.length
    let ipsLength: number | undefined
    // For each ip grouping listed under the networkinterfaceinfo, etc
    for (let k = 0, m = networkInterfaceInfoLength; k < m; ++k) {
      const networkInterface = networkInterfaceInfo[k]
      const family = networkInterface.family
      // Check and make sure that the family is one we care about
      const familyMatched = this.interfaceInfoMatcher(family)
      const isLocal = networkInterface.internal
      // If familyMatched has a value and isn't null,
      if (familyMatched) {
        // and we want to retrieve any ip, regardless of whether it's local or not
        if (this.retrieveLocal) {
          // add the ip address to the list of ips we're retrieving
          ips.push(networkInterface.address)
          ipsLength = ips.length
        } else {
          // else if we don't want to collect local ips,
          if (!isLocal) {
            // check if it is local.  If it isn't, push it to the ips we care about
            ips.push(networkInterface.address)
            ipsLength = ips.length
          }
        }
      }
      if (ipsLength && ipsLength >= this.countToRetrieve) {
        // If we've collected as many ips as we want to, stop.
        break
      }
    }
    return ipsLength
  }

  /**
   * Creates a matching function to match a string against an array of strings or a single string.
   * If 'all' was given, it will return a function that matches all.
   * @param generationMethod The name or array of names of the interfaces to match
   * @returns  A function that returns interface names.
   */
  private matcherGenerator(generationMethod: string | string[]) {
    let matchBy: (stringToMatch: string) => string | null
    if (Array.isArray(generationMethod)) {
      // A function that will search the array of strings for the given string, and return the given string
      // if it exists in the array
      matchBy = (interfaceName: string) => {
        if (generationMethod.indexOf(interfaceName) > 0) {
          return interfaceName
        } else return null
      }
    } else if (generationMethod === 'all') {
      // A function that just returns anything fed to it
      matchBy = (stringToMatch: string) => stringToMatch
    } else {
      // A function that compares two strings, and returns the string if it is the same
      matchBy = (stringToMatch: string) => {
        if (generationMethod === stringToMatch) {
          return generationMethod
        } else return null
      }
    }
    return matchBy
  }
}
