export const trimAddress = (address: string, cutoff = 4) => 
    [
        address.substring(0, cutoff),
        "...",
        address.substring(address.length - cutoff, address.length)
    ];