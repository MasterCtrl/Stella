import Kernel from "./os/Kernel";

export const loop = () => {
    const kernel = new Kernel();
    kernel.Run();
};
