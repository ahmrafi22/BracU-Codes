import { useEffect, useState } from "react";


export const useScrollTop = (limit =10) => {
    const [scrolled, setScrolled] = useState(false)

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > limit){
                setScrolled(true);
            } else{
                setScrolled(false)
            }
        };
        window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener("scroll", handleScroll)
    }, [limit])

    return scrolled
}