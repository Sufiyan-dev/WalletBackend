const assetOptinCheckerAndIndexerFinder = (assetOptinArray,addressToFind) => {
    let message = {hasFound: false, index: ""}
    for(let i in assetOptinArray){
        if(assetOptinArray[i].address == addressToFind){
            message = {hasFound: true, index: i}
            return message
        }
    }
    return message
}

export { assetOptinCheckerAndIndexerFinder }