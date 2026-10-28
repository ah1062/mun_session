export const VotingStatus = {
    ABSENT: "A",
    PRESENT: "P",
    PRESENT_AND_VOTING: "PV"
};

export class Country {
    constructor(imgUrl, shortName, longName, isoCode, status) {
        this.imgUrl = imgUrl;
        this.isoCode = isoCode ?? 'XX';
        this.shortName = shortName;
        this.longName = longName;
        this.votingStatus = VotingStatus.ABSENT;
        this.observerStatus = false;
    }

    setVotingStatus(status) {
        if (status === VotingStatus.PRESENT_AND_VOTING && this.observerStatus) {
            throw new Error("An observer must be able to abstain");
        }

        this.votingStatus = status;
        return true;
    }

    canAbstain() {
        if (this.votingStatus !== VotingStatus.PRESENT) return false;
        return true;
    }
}