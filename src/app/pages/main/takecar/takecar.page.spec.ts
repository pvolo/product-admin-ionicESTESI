import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TakecarPage } from './takecar.page';

describe('TakecarPage', () => {
  let component: TakecarPage;
  let fixture: ComponentFixture<TakecarPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(TakecarPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
