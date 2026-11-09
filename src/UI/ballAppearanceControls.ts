import { ParticleDebugRenderer } from '../rendering/ParticleDebugRenderer';

const BALL_COLORS = [
    { name: 'Blue', value: '#3399ff' },
    { name: 'Red', value: '#ff4d4d' },
    { name: 'Green', value: '#4caf50' },
    { name: 'Yellow', value: '#ffeb3b' },
    { name: 'Orange', value: '#ff9800' },
    { name: 'Purple', value: '#9c27b0' },
    { name: 'Pink', value: '#e91e63' },
    { name: 'Cyan', value: '#00bcd4' },
    { name: 'White', value: '#ffffff' },
    { name: 'Black', value: '#212121' },
    { name: 'Brown', value: '#795548' },
    { name: 'Lime', value: '#8bc34a' }
] as const;

export class BallAppearanceControls {
    constructor(
        container: HTMLElement,
        summary: HTMLElement,
        debugRenderer: ParticleDebugRenderer,
        title: string,
        onColorChange: (color: string) => void,
        onNameChange: (name: string) => void
    ) {
        this.createDiagnosticsControl(container, debugRenderer);
        this.createNameControl(container, summary, debugRenderer, title, onNameChange);
        this.createColorControl(container, onColorChange);
    }

    private createDiagnosticsControl(
        container: HTMLElement,
        debugRenderer: ParticleDebugRenderer
    ): void {
        const label = document.createElement('label');
        label.style.display = 'block';
        label.style.marginTop = '8px';

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = false;
        debugRenderer.setVisible(false);
        checkbox.addEventListener('change', () => {
            debugRenderer.setVisible(checkbox.checked);
        });

        label.append(checkbox, ' Diagnostics visible');
        container.appendChild(label);
    }

    private createNameControl(
        container: HTMLElement,
        summary: HTMLElement,
        debugRenderer: ParticleDebugRenderer,
        title: string,
        onNameChange: (name: string) => void
    ): void {
        const wrapper = document.createElement('div');
        wrapper.style.marginTop = '8px';

        const label = document.createElement('label');
        label.textContent = 'Ball name';
        label.style.display = 'block';

        const input = document.createElement('input');
        input.type = 'text';
        input.value = title.replace(/ Controls$/, '');
        input.maxLength = 32;
        input.style.width = '100%';
        input.style.boxSizing = 'border-box';
        input.addEventListener('change', () => {
            const name = input.value.trim() || title.replace(/ Controls$/, '');
            input.value = name;
            summary.textContent = `${name} Controls`;
            debugRenderer.setName(name);
            onNameChange(name);
        });

        wrapper.append(label, input);
        container.appendChild(wrapper);
    }

    private createColorControl(
        container: HTMLElement,
        onColorChange: (color: string) => void
    ): void {
        const wrapper = document.createElement('div');
        wrapper.style.marginTop = '8px';

        const label = document.createElement('label');
        label.textContent = 'Colour';
        label.style.display = 'block';

        const palette = document.createElement('div');
        palette.style.display = 'grid';
        palette.style.gridTemplateColumns = 'repeat(6, 1fr)';
        palette.style.gap = '4px';
        palette.style.marginTop = '8px';

        for (const color of BALL_COLORS) {
            const option = document.createElement('button');
            option.type = 'button';
            option.title = color.name;
            option.setAttribute('aria-label', color.name);
            option.style.width = '18px';
            option.style.height = '18px';
            option.style.minWidth = '0';
            option.style.padding = '0';
            option.style.borderRadius = '50%';
            option.style.backgroundColor = color.value;
            option.style.border = color.name === 'White'
                ? '2px solid #888'
                : '2px solid rgba(255, 255, 255, 0.7)';
            option.addEventListener('click', () => {
                onColorChange(color.value);
            });
            palette.appendChild(option);
        }

        wrapper.append(label, palette);
        container.appendChild(wrapper);
    }
}
