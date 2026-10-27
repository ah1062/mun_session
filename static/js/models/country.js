export class Country {
    constructor(
        imgUrl,
        shortName,
        longName,
        votingStatus,
        observerStatus,
    ) {
       this.imgUrl = imgUrl;
       this.shortName = shortName;
       this.longName = longName; 

       this.votingStatus = votingStatus;
       this.observerStatus = observerStatus;
    }
}