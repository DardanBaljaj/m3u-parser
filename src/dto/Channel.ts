export interface Channel {
    index: number;
    header: {
        extinf: string;
        tvg_id: string | null;
        tvg_name: string | null;
        tvg_logo: string | null;
        group_title: string | null;
        name: string | null;
    };
    other: string[];
}