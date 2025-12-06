import {
    Card,
    CardAction,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import Image from "next/image";
import ExpolreButton from "./ExpolreButton";

interface HomeCardProps {
    title: string;
    description: string;
    image: string;
}

export default function HomeCard({ title, description, image }: HomeCardProps) {
    return (
        <Card>
            <CardHeader>
                <Image src={image} alt="Logo" width={200} height={56} />
            </CardHeader>
            <CardContent>
                <CardTitle className="text-xl font-bold mb-2 tracking-tighter">{title}</CardTitle>
                <CardDescription>{description}</CardDescription>
            </CardContent>
            <CardFooter className="flex justify-end items-end w-full h-full">
                <ExpolreButton />
            </CardFooter>
        </Card>
    );
}