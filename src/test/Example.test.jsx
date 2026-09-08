import { render, screen } from '@testing-library/react';

function Example() {
    return <h1>ElectroSoft funciona</h1>;
}

test('muestra el mensaje de ElectroSoft', () => {
    render(<Example />);

    expect(screen.getByText('ElectroSoft funciona')).toBeInTheDocument();
});