import gsap from "gsap";

export function animateCan4(can) {
    const isMobile = window.innerWidth <= 768;

    const target = {
        position: {
            x: isMobile ? -0.28 : -0.15,
            y: isMobile ? -0.8 : -0.9,
            z: 0.12
        },
        rotation: { x: -0.05, y: 3.2, z: -0.58 },
        scale: isMobile ?1 : 1.5
    };

    const start = {
        x: -4,
        y: -2.5
    };

    const state = {
        x: start.x,
        y: start.y
    };

    const radius = 0.33;

    can.position.set(
        start.x,
        start.y,
        target.position.z
    );

    can.rotation.set(
        Math.PI / 2,
        0,
        0
    );

    can.scale.setScalar(
        target.scale
    );

    const tl = gsap.timeline();

    tl.to(state, {
        x: target.position.x,
        y: target.position.y,
        duration: 2.5,
        ease: "power3.out",
        onUpdate: () => {
            const dx = state.x - start.x;
            const dy = state.y - start.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            can.position.x = state.x;
            can.position.y = state.y;
            can.rotation.y = -Math.sin(distance / radius);
            can.rotation.z = Math.cos(distance / radius) * 0.1;
        }
    });

    tl.to(can.rotation, {
        x: 0.05,
        y: 0,
        z: -target.rotation.z,
        duration: 1.25,
        ease: "bounce.out"
    });

    return tl;
}