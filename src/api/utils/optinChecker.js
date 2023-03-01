

const assetOptinCheckerAndIndexerFinder = (assetOptinArray, addressToFind) => {
    const data = assetOptinArray.map((asset,i) => {
        if(asset.address === addressToFind){
            return {"hasFound": true,"index": i}
        }
    })

    const assetExist = data[0]

    return assetExist ? assetExist : {"hasFound": false, "index": ""}
}

export { assetOptinCheckerAndIndexerFinder }