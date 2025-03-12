"use client";

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import React, { useState } from 'react';

export default function Home() {
    const [count, setCount] = useState(0);
    return (
        <>
            <div id="header">
                <h1 className="font-bold text-2xl">Home</h1>
            </div>
            <div className="grid gap-4 h-full" style={{ gridTemplateAreas: "'a b' 'c c'" }}>
                <Card style={{ gridArea: 'a' }}>
                    <CardHeader>
                        <CardTitle>Card</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p>Count: {count}</p>
                        <Button onClick={() => setCount(count + 1)}>Click me</Button>
                    </CardContent>
                </Card>
                <Card style={{ gridArea: 'b' }}>
                    <CardHeader>
                        <CardTitle>Card</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p>Content</p>
                    </CardContent>
                </Card>
                <Card style={{ gridArea: 'c' }}>
                    <CardHeader>
                        <CardTitle>Card</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p>Content</p>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
