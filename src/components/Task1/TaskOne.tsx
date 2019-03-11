import * as React from "react";
import BinaryInput from "../BinaryInput/BinaryInput";
import { Divider, Form, InputOnChangeData, Statistic, Button } from "semantic-ui-react";
import { observer } from "mobx-react";
import { observable } from "mobx";
import { Binary } from "../Binary/Binary";
import bind from "../../decorators/bind";


@observer
class TaskOne extends React.Component {
    @observable private binary: Binary = new Binary();
    @observable private i: number = 0;
    @observable private j: number = 0;

    public render() {
        return (
            <Form>
                <Statistic>
                    <Statistic.Value>{this.binary.toString(32)}</Statistic.Value>
                    <Statistic.Label>32-bit representation</Statistic.Label>
                </Statistic>

                <Form.Field>
                    <BinaryInput
                        label="Enter 32-bit digit:"
                        value={this.binary.toString()}
                        onChange={this.handleInputChange}
                    />
                </Form.Field>

                <Statistic size="mini" floated="right">
                    <Statistic.Value>{this.binary.getBit(this.j)}</Statistic.Value>
                    <Statistic.Label>j-th bit</Statistic.Label>
                </Statistic>

                <Statistic size="mini" floated="right">
                    <Statistic.Value>{this.binary.getBit(this.i)}</Statistic.Value>
                    <Statistic.Label>i-th bit</Statistic.Label>
                </Statistic>

                <Form.Group unstackable inline>
                    <Form.Input
                        label="i"
                        type="number"
                        min="0"
                        max="31"
                        size="mini"
                        value={this.i}
                        onChange={this.createIndexChangeHandler("i")}
                    />
                    <Form.Input
                        label="j"
                        type="number"
                        min="0"
                        max="31"
                        size="mini"
                        value={this.j}
                        onChange={this.createIndexChangeHandler("j")}
                    />
                </Form.Group>

                <Divider />

                <div className="mb-4">
                    <Button.Group>
                        <Button type="button" positive onClick={this.createEnableBitHandler("i")}>Enable i-th bit</Button>
                        <Button.Or />
                        <Button type="button" secondary onClick={this.createDisableBitHandler("i")}>Disable i-th bit</Button>
                    </Button.Group>
                </div>

                <div className="mb-4">
                    <Button.Group>
                        <Button type="button" positive onClick={this.createEnableBitHandler("j")}>Enable j-th bit</Button>
                        <Button.Or />
                        <Button type="button" secondary onClick={this.createDisableBitHandler("j")}>Disable j-th bit</Button>
                    </Button.Group>
                </div>

                <div className="mb-4">
                    <Button type="button" onClick={this.onSwapClick}>Swap i-th and j-th bits</Button>
                </div>

                <div className="mb-4">
                    <Button type="button" onClick={this.onResetClick}>Reset i LSBs</Button>
                </div>

                <div className="mb-4">
                    <Button type="button" onClick={this.onConcatClick}>Concat i MSBs and j LSBs</Button>
                </div>

                <div className="mb-4">
                    <Button type="button" onClick={this.onGetInnerClick}>Get inner bits between i and j</Button>
                </div>

                <div className="mb-4">
                    <Button type="button" onClick={this.onSwapBytesClick}>Swap i-th and j-th bytes</Button>
                </div>
            </Form>
        );
    }

    @bind
    private handleInputChange(value: string) {
        this.binary.value = value;
    }

    @bind
    private createIndexChangeHandler(indexName: "i" | "j") {
        return (e: React.ChangeEvent, data: InputOnChangeData) => {
            const n = Number(data.value);
            if (n < 0 || n > 31) {
                return;
            }

            this[indexName] = n;
        };
    }

    @bind
    private createEnableBitHandler(bit: "i" | "j") {
        return () => this.binary.enableBit(this[bit]);
    }

    @bind
    private createDisableBitHandler(bit: "i" | "j") {
        return () => this.binary.disableBit(this[bit]);
    }

    @bind
    private onSwapClick() {
        this.binary.swapBits(this.i, this.j);
    }

    @bind
    private onResetClick() {
        this.binary.resetBits(this.i);
    }

    @bind
    private onConcatClick() {
        this.binary.value = this.binary.getOuterBits(this.i, this.j);
    }

    @bind
    private onGetInnerClick() {
        this.binary.value = this.binary.getInnerBits(this.i, this.j);
    }

    @bind
    private onSwapBytesClick() {
        this.binary.swapBytes(this.i, this.j);
    }
}

export default TaskOne;
