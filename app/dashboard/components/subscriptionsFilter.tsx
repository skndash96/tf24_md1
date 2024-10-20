import React, { useEffect, useState } from 'react';
import { Dialog, DialogTrigger, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from '@/components/ui/button';
import { CiFilter } from "react-icons/ci";

export default function SubscriptionsFilter({
    setData,
    setError
}: {
    data: any[],
    setData: (data: any[]) => void,
    error: boolean,
    setError: (b: boolean) => void
}) {
    const [user, setUser] = useState('');
    const [plan, setPlan] = useState<"member"|"regular"|"vip">();
    const [clear, setClear] = useState(0);

    useEffect(() => {
        handleSubmit();
    }, [clear]);

    const handleReset = () => {
        setUser('');
        setPlan(undefined);
        setClear(c => c+1);
    };

    const handleSubmit = async () => {
        setError(false);

        const q = Object.entries({
            user,
            plan
        }).filter(([_, v]) => v);

        const params = new URLSearchParams(q as any).toString();

        console.log(params);

        try {
            const res = await fetch(`/api/subscriptions?${params}`);
            const json = await res.json();
            
            setData(json);
        } catch (error) {
            console.error(error);
            setError(true);
        }
    };

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button className='flex items-center gap-2' variant="link">
                    <CiFilter />
                    Filter
                </Button>
            </DialogTrigger>

            <DialogContent>
                <DialogTitle>Subscriptions Filter</DialogTitle>
                <div className='flex flex-col gap-4'>
                    <Input onChange={e => setUser(e.target.value || "")} id="user" name="user" placeholder="User name/email" />
                    
                    <div>
                        <Select onValueChange={v => setPlan(v as any)}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select Plan" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="member">Member</SelectItem>
                                <SelectItem value="premium">Premium</SelectItem>
                                <SelectItem value="vip">VIP</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    
                    <div className="w-fit ml-auto">
                        <Button variant="link" className="text-red-500"  onClick={handleReset}>
                            Clear
                        </Button>
                        <Button onClick={handleSubmit}>
                            Apply
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};