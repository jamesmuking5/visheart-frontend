'use client'

import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Image from 'next/image'
import Link from 'next/link'

function Background() {
    return (
        <Image
            className="z-0 blur-xs hover:blur-none transition-all"
            alt='A picture of Cardiac MRI slices used as a background image'
            src='/visheart_logo_background.jpeg'
            // placeholder='blur'
            quality={80}
            fill
            sizes='100vw'
            style={{
                objectFit: 'cover',
            }}
        />
    )
}

function LoginCard() {
    return (
        <div className="flex justify-center items-center w-full h-[600px]">
            <Card className="z-10 w-[400px]">
                <CardHeader className="text-center">
                    <CardTitle>
                        Login
                    </CardTitle>
                    <CardDescription>
                        No Account? Click on the Register button!
                    </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-6">
                    <div className="grid gap-3">
                        <Label htmlFor="username">Username</Label>
                        <Input id="username" defaultValue="Username" required />
                    </div>
                    <div className="grid gap-3">
                        <Label htmlFor="password">Password</Label>
                        <Input id="password" type="password" required />
                    </div>
                </CardContent>
                <CardFooter className="grid gap-2">
                    <Button>Login</Button>
                    <Button className="bg-red-500 hover:bg-red-700"><Link href='/register' >Register</Link></Button>
                </CardFooter>
            </Card>
        </div>
    )
}


export default function Login() {
    return (
        <>
            <Background />
            <main className="relative flex items-center justify-center h-full w-full">
                <LoginCard />
            </main>
        </>
    );
}