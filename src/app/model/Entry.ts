export interface Entry {
    key?: string;
    owner: string;
    url: string;
    image?: any; // see tab2 and cloud service
    title: string;
    description: string;
    lat: number;
    long: number;
    date: Date;
}
