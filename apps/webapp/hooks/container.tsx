
interface Props {
    children: React.ReactNode;
    className?: string;
}
export default function Container({ children, className }: Props) {
    return (
        <div className={`max-w-screen-md mx-auto px-4 lg:px-5 ${className}`}>
            {children}
        </div>
    );
};

// export default container;