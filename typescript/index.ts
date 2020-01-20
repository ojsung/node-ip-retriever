import { networkInterfaces, NetworkInterfaceInfo } from 'os'
/**
 * Retrieves the IP from the operating system, and returns it as a string
 * @param ipFamily IPv4 or v6.  For all, give the string "all."  Default is "all"
 * @param ifName The name of the interface for which you want to retrieve IP addresses.  For all, give the string "all." Default is "all"
 * @param retrieveLocal False by default.  If set to true, it will also include local addresses (127.0.0.1)
 * @param countToRetrieve How many IP addresses to retrieve.  By default, it will retrieve just one, the first it retrieves.  To retrieve all, give the number -1.
 */
export default function retrieveIp(
  ipFamily: 'all' | 'IPv6' | 'IPv4' = 'all',
  ifName: string | string[] | 'all' = 'all',
  retrieveLocal: boolean = false,
  countToRetrieve: number = 1
): string[] {
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
    this.checkForMatches()
  }

  private interfaceMatcher: (interfaceName: string) => string | null
  private interfaceInfoMatcher: (interfaceName: string) => string | null
  private interfaces: { [key: string]: NetworkInterfaceInfo[] } = networkInterfaces()
  public get matchedInterfaceInfo() {
    return this._matchedInterfaceInfo
  }

  private _matchedInterfaceInfo: string[] = []

  private checkForMatches() {
    let continueCounting: () => boolean
    if (this.countToRetrieve > 1) {
      continueCounting = () => this._matchedInterfaceInfo.length < this.countToRetrieve
    } else {
      continueCounting = () => true
    }
    while (continueCounting()) {}
    const interfaceKeys: string[] = Object.keys(this.interfaces)
    const matchedInterfaces: NetworkInterfaceInfo[][] = []

    interfaceKeys.forEach((interfaceKey: string) => {
      const iface = this.interfaces[interfaceKey]
      if (this.interfaceMatcher(interfaceKey)) {
        matchedInterfaces.push(iface)
      }
    })
    this.buildMatches(matchedInterfaces, this._matchedInterfaceInfo)
  }

  private buildMatches(
    matchedInterfaces: NetworkInterfaceInfo[][],
    matchedInterfaceInfo: string[]
  ) {
    matchedInterfaces.forEach((matchedInterface: NetworkInterfaceInfo[]) => {
      matchedInterface.forEach((interfaceInfo: NetworkInterfaceInfo) => {
        const family: 'IPv4' | 'IPv6' = interfaceInfo.family
        const ip: string = interfaceInfo.address
        const isLocal: boolean = interfaceInfo.internal
        const familyMatch = this.interfaceInfoMatcher(family)
        if (this.retrieveLocal) {
          if (familyMatch) {
            matchedInterfaceInfo.push(ip)
          }
        } else {
          if (family && !isLocal) {
            matchedInterfaceInfo.push(ip)
          }
        }
      })
    })
  }

  private matcherGenerator(generationMethod: string | string[]) {
    let matchBy: (interfaceName: string) => string | null
    if (Array.isArray(generationMethod)) {
      matchBy = (interfaceName: string) => {
        if (generationMethod.indexOf(interfaceName) > 0) {
          return interfaceName
        } else return null
      }
    } else if (generationMethod === 'all') {
      matchBy = (interfaceName: string) => interfaceName
    } else {
      matchBy = (interfaceName: string) => {
        if (generationMethod === interfaceName) {
          return generationMethod
        } else return null
      }
    }
    return matchBy
  }
}
