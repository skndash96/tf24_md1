"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useEffect, useState } from "react";
import { CiFilter } from "react-icons/ci";

export default function SaleFilter({
    setData,
    setError
}: {
    data: any[],
    setData: (data: any[]) => void,
    error: boolean,
    setError: (b: boolean) => void
}) {
    const [cost, setCost] = useState<number>();
    const [costCmp, setCostCmp] = useState<string>();
    const [start, setStart] = useState<string>();
    const [end, setEnd] = useState<string>();
    const [userName, setUserName] = useState<string>();
    const [itemName, setItemName] = useState<string>();
    const [clear, setClear] = useState(0);

    useEffect(() => {
        handleSubmit();
    }, [clear]);

    const handleReset = () => {
        setCost(undefined);
        setCostCmp(undefined);
        setStart(undefined);
        setEnd(undefined);
        setUserName(undefined);
        setItemName(undefined);
        setClear(c => c+1);
        return;
    };

    const handleSubmit = async () => {
        setError(false);

        const q = Object.entries({
            cost,
            costCmp,
            user: userName,
            item: itemName,
            start,
            end
        }).filter(([_, v]) => v);

        const params = new URLSearchParams(q as any).toString();

        console.log(params);

        try {
            const res = await fetch(`/api/sales?${params}`);
            const json = await res.json();

            setData(json);
        } catch (error) {
            console.error(error);
            setError(true);
        }
    };

    useEffect(() => {
        handleSubmit();
    }, []);

    return (
        <div>
            <Dialog>
                <DialogContent>
                    <DialogTitle>
                        Sales Filter
                    </DialogTitle>

                    <div className="flex gap-2 items-center">
                        <span>Cost:</span>

                        <Select defaultValue="gt" onValueChange={(value) => setCostCmp(value)}>
                            <SelectTrigger className="max-w-16">
                                <SelectValue placeholder="Comparison" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="gt">&gt;</SelectItem>
                                <SelectItem value="lt">&lt;</SelectItem>
                            </SelectContent>
                        </Select>

                        <Input
                            type="number"
                            placeholder="Cost"
                            value={cost ?? ''}
                            onChange={(e) => setCost(e.target.value ? parseFloat(e.target.value) : undefined)}
                        />
                    </div>

                    <Input
                        placeholder="User Name"
                        value={userName ?? ''}
                        onChange={(e) => setUserName(e.target.value)}
                    />

                    <Input
                        placeholder="Item Name"
                        value={itemName ?? ''}
                        onChange={(e) => setItemName(e.target.value)}
                    />

                    <div className="flex items-center gap-2">
                        <label className="shrink-0">Start Date</label>
                        <Input
                            className="shrink"
                            type="date"
                            placeholder="Date"
                            value={start ?? ''}
                            onChange={(e) => setStart(e.target.value)}
                        />
                    </div>

                    <div className="flex items-center gap-2">
                        <label className="shrink-0">End Date</label>
                        <Input
                            className="shrink"
                            type="date"
                            placeholder="Date"
                            value={end ?? ''}
                            onChange={(e) => setEnd(e.target.value)}
                        />
                    </div>

                    <div className="w-fit ml-auto">
                        <Button variant="link" className="text-red-500"  onClick={handleReset}>
                            Clear
                        </Button>
                        <Button onClick={handleSubmit}>
                            Apply
                        </Button>
                    </div>
                </DialogContent>

                <DialogTrigger className="flex items-center gap-2 hover:underline">
                    <CiFilter />
                    Filter
                </DialogTrigger>
            </Dialog>
        </div>
    );
}