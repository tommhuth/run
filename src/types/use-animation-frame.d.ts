declare module "use-animation-frame" {
    export default function (cb: (state: { delta: number, time: number }) => void): void
}