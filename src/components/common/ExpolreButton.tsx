import { ArrowRightIcon, ArrowUpIcon } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function ExpolreButton() {
    return (
        <div className="flex flex-wrap items-center gap-2 md:flex-row">
            <Button variant="outline">Explore<ArrowRightIcon />
            </Button>
        </div>
    )
}