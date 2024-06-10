import type { ImageFormat } from "./base";

export interface IEvent {
    id: number;
    attributes: {
        title: string;
        description: string;
        content: {
            type: "paragraph";
            children: {
                text: string;
                type: "text";
            }[];
        }[];
        createdAt: string;
        updatedAt: string;
        publishedAt: string;
        listingCode: string;
        domainCode: string;
        banner: {
            data: {
                id: number;
                attributes: {
                    name: string;
                    alternativeText: string | null;
                    caption: string | null;
                    width: number;
                    height: number;
                    formats: {
                        small: ImageFormat;
                        medium: ImageFormat;
                        thumbnail: ImageFormat;
                    };
                    hash: string;
                    ext: string;
                    mime: string;
                    size: number;
                    url: string;
                    previewUrl: string | null;
                    provider: string;
                    provider_metadata: any | null;
                    createdAt: string;
                    updatedAt: string;
                };
            };
        };
    };
}
